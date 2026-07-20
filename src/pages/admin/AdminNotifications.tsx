import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Send, 
  Users, 
  Target, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  History,
  Trash2,
  Megaphone,
  Layout
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, getDocs, addDoc, Timestamp, orderBy, limit, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminNotifications() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'All' | 'Specific'>('All');
  const [category, setCategory] = useState<'general' | 'test' | 'material' | 'exam'>('general');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const q = query(collection(db, 'notifications_history'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setHistory(list);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('Title and Message are required');
      return;
    }

    setSubmitting(true);
    try {
      const notificationData = {
        title: title.trim(),
        message: message.trim(),
        type: 'info',
        category,
        read: false,
        createdAt: new Date().getTime(),
        sentAt: Timestamp.now()
      };

      if (targetType === 'All') {
        // In a real app, you'd use a Cloud Function for this.
        // For demonstration, we'll fetch all users and batch write.
        const userSnap = await getDocs(collection(db, 'users'));
        const users = userSnap.docs.map(d => d.id);
        
        // Firebase Batch limit is 500. For more users, we need multiple batches.
        const chunks = [];
        for (let i = 0; i < users.length; i += 450) {
          chunks.push(users.slice(i, i + 450));
        }

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach(uid => {
            const ref = doc(collection(db, 'users', uid, 'notifications'));
            batch.set(ref, notificationData);
          });
          await batch.commit();
        }

        // Save to history
        await addDoc(collection(db, 'notifications_history'), {
          ...notificationData,
          targetType,
          userCount: users.length
        });

      } else {
        toast.error('Specific user targeting not implemented in this demo');
      }

      toast.success('Notifications sent successfully!');
      setTitle('');
      setMessage('');
      
      // Refresh history
      const q = query(collection(db, 'notifications_history'), orderBy('createdAt', 'desc'), limit(10));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));

    } catch (err) {
      console.error(err);
      toast.error('Failed to send notifications');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteHistory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications_history', id));
      setHistory(history.filter(h => h.id !== id));
      toast.success('Record deleted');
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen">
      <header className="mb-8">
         <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#5B5FFB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#5B5FFB]/20">
              <Megaphone className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Broadcast Center</h1>
         </div>
         <p className="text-gray-500">Send real-time alerts and announcements to your students.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Compose Panel */}
        <div className="lg:col-span-5">
           <form onSubmit={handleSend} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Notification Title</label>
                    <input 
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., New UPSC Test Released!"
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#5B5FFB] focus:bg-white outline-none transition-all font-bold text-gray-700"
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Announcement Message</label>
                    <textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Detailed message about the update..."
                      rows={4}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#5B5FFB] focus:bg-white outline-none transition-all font-medium text-gray-700 resize-none"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Audience</label>
                       <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                          <button 
                            type="button"
                            onClick={() => setTargetType('All')}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${targetType === 'All' ? 'bg-white shadow-sm text-[#5B5FFB]' : 'text-gray-400'}`}
                          >
                             All Users
                          </button>
                          <button 
                            type="button"
                            onClick={() => setTargetType('Specific')}
                            className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-tighter transition-all ${targetType === 'Specific' ? 'bg-white shadow-sm text-[#5B5FFB]' : 'text-gray-400'}`}
                          >
                             Segment
                          </button>
                       </div>
                    </div>
                    <div>
                       <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                       <select 
                         value={category}
                         onChange={(e) => setCategory(e.target.value as any)}
                         className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-gray-700 text-xs outline-none"
                       >
                         <option value="general">General</option>
                         <option value="test">Test Series</option>
                         <option value="material">Study Material</option>
                         <option value="exam">Exams</option>
                       </select>
                    </div>
                 </div>

                 <button 
                   type="submit"
                   disabled={submitting}
                   className="w-full py-4 bg-[#5B5FFB] text-white font-black rounded-2xl shadow-xl shadow-[#5B5FFB]/20 hover:bg-[#4A4DE0] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                   {submitting ? 'Broadcasting...' : 'Send Broadcast'}
                 </button>
              </div>
           </form>
        </div>

        {/* History Panel */}
        <div className="lg:col-span-7">
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <History className="w-5 h-5 text-gray-400" />
                    Recent Broadcasts
                 </h3>
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">History</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 {loading ? (
                   <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#5B5FFB]" /></div>
                 ) : history.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                      <Bell className="w-12 h-12 mb-4" />
                      <p className="text-xs font-black uppercase tracking-widest">No broadcast history</p>
                   </div>
                 ) : (
                   history.map((h) => (
                     <div key={h.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 relative group">
                        <button 
                          onClick={() => deleteHistory(h.id)}
                          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center gap-3 mb-3">
                           <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                             h.category === 'test' ? 'bg-blue-100 text-blue-600' :
                             h.category === 'material' ? 'bg-purple-100 text-purple-600' :
                             'bg-gray-200 text-gray-600'
                           }`}>{h.category}</span>
                           <span className="text-[10px] font-bold text-gray-400">
                             {h.sentAt ? h.sentAt.toDate().toLocaleString() : 'Recently'}
                           </span>
                        </div>
                        
                        <h4 className="font-bold text-gray-900 mb-1">{h.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">{h.message}</p>
                        
                        <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Sent to {h.userCount || 0} Users</span>
                           <span className="flex items-center gap-1 text-green-500"><CheckCircle className="w-3 h-3" /> Delivered</span>
                        </div>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
