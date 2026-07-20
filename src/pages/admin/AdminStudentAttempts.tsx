import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Users, 
  Target, 
  RotateCcw, 
  Loader2, 
  ChevronRight, 
  Clock, 
  Trophy,
  ArrowRight,
  MoreVertical,
  Trash2,
  Download
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, getDocs, deleteDoc, doc, orderBy, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function AdminStudentAttempts() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('All');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const q = query(collection(db, 'results'), orderBy('submittedAt', 'desc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAttempts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const handleResetAttempt = async (id: string) => {
    if (!confirm('Are you sure you want to reset this attempt? This action is irreversible.')) return;
    try {
      await deleteDoc(doc(db, 'results', id));
      setAttempts(attempts.filter(a => a.id !== id));
      toast.success('Attempt reset successfully');
    } catch (err) {
      toast.error('Failed to reset attempt');
    }
  };

  const filteredAttempts = attempts.filter(a => {
    const matchesSearch = a.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.testTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'All' || a.testId === selectedExam;
    return matchesSearch && matchesExam;
  });

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
         <div>
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-gray-900 dark:text-white shadow-lg shadow-indigo-600/20">
                 <History className="w-6 h-6" />
               </div>
               <h1 className="text-2xl font-bold text-gray-900">Student Test Attempts</h1>
            </div>
            <p className="text-gray-500 font-medium">Monitoring and managing student performance records.</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-colors">
               <Download className="w-4 h-4" /> Export All
            </button>
         </div>
      </header>

      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by student name or test ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all font-bold text-sm"
            />
         </div>
         <div className="w-full md:w-64">
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full px-6 py-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl font-bold text-gray-600 text-sm outline-none"
            >
               <option value="All">All Exams</option>
               {/* In a real app, populate from tests collection */}
               <option value="ssc-cgl">SSC CGL</option>
               <option value="upsc-prelims">UPSC Prelims</option>
            </select>
         </div>
      </div>

      {/* Attempts Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-gray-50/50">
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Test Attempted</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Score</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Accuracy</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {filteredAttempts.map((attempt) => (
                     <tr key={attempt.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                                 {attempt.userName?.[0] || 'S'}
                              </div>
                              <div>
                                 <h4 className="font-bold text-gray-900 text-sm">{attempt.userName}</h4>
                                 <p className="text-[10px] font-bold text-gray-400 tracking-tighter">ID: {attempt.userId?.substring(0, 8)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <h4 className="font-bold text-gray-900 text-sm">{attempt.testTitle}</h4>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attempt #{attempt.attemptNumber || 1}</p>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <span className="text-sm font-black text-gray-900">{attempt.score}/{attempt.totalMarks}</span>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <div className="flex flex-col items-center gap-1">
                              <span className="text-sm font-black text-emerald-600">{attempt.accuracy}%</span>
                              <div className="w-12 bg-gray-100 dark:bg-gray-800 h-1 rounded-full overflow-hidden">
                                 <div className="bg-emerald-500 h-full" style={{ width: `${attempt.accuracy}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2 text-gray-500 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              {attempt.submittedAt ? format(attempt.submittedAt, 'MMM dd, HH:mm') : 'Recently'}
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleResetAttempt(attempt.id)}
                                className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Reset Attempt"
                              >
                                 <RotateCcw className="w-4 h-4" />
                              </button>
                              <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                 <ChevronRight className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredAttempts.length === 0 && (
            <div className="py-20 text-center">
               <History className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No attempts found matching criteria</p>
            </div>
         )}
      </div>
    </div>
  );
}
