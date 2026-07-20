import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Plus, Edit2, Trash2, X, Loader2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminUpdates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    category: 'News',
    active: true
  });
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubUpdates = onSnapshot(collection(db, 'latestUpdates'), (snap) => {
      setUpdates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.id !== '_init'));
      setLoading(false);
    });

    return () => unsubUpdates();
  }, []);

  const openModal = (update: any = null) => {
    if (update) {
      setEditingId(update.id);
      setFormData({
        title: update.title || '',
        description: update.description || update.summary || '',
        date: update.date || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        category: update.category || 'News',
        active: update.active !== false
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        category: 'News',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const savePayload = { ...formData };

      if (editingId) {
        await updateDoc(doc(db, 'latestUpdates', editingId), savePayload);
        toast.success('Update saved successfully');
      } else {
        await addDoc(collection(db, 'latestUpdates'), savePayload);
        toast.success('Update created successfully');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        await deleteDoc(doc(db, 'latestUpdates', id));
        toast.success('Update deleted successfully');
      } catch (error) {
        toast.error('Failed to delete update');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Current Affairs & Updates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage latest news, notifications, and current affairs.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Update
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-[#151521] text-gray-600 dark:text-gray-400 font-medium border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {updates.map((update) => (
                <tr key={update.id} className="hover:bg-gray-50 dark:bg-[#151521]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="line-clamp-2">{update.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {update.category}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                    {update.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(update)} className="p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(update.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {updates.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">No updates found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-xl w-full max-w-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#1E1E2D] rounded-t-2xl z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Update' : 'Add Update'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none bg-white dark:bg-[#1E1E2D]">
                    <option value="News">News</option>
                    <option value="Current Affairs">Current Affairs</option>
                    <option value="Notification">Notification</option>
                    <option value="Daily Quiz">Daily Quiz</option>
                    <option value="Vacancies">Vacancies</option>
                    <option value="Admit Card">Admit Card</option>
                    <option value="Answer Key">Answer Key</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="text" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" placeholder="e.g. 15 Oct, 2026" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description / Summary *</label>
                <textarea rows={4} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB]/20 focus:border-[#5B5FFB] transition-all outline-none" />
              </div>

              <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-[#1E1E2D]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:bg-[#151521] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="bg-[#5B5FFB] hover:bg-[#4A4DE0] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:opacity-70">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
