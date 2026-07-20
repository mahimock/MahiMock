import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { BarChart3, Search, Loader2, CheckCircle, XCircle, Eye, Clock, Calendar, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminResults() {
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'published'>('pending');
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'results'));
    const unsub = onSnapshot(q, (snap) => {
      const res = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.sort((a: any, b: any) => (b.submittedAt || 0) - (a.submittedAt || 0));
      setResults(res);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handlePublish = async (result: any) => {
    if (!window.confirm('Are you sure you want to publish this result?')) return;
    setPublishingId(result.id);
    try {
      await updateDoc(doc(db, 'results', result.id), {
        status: 'published'
      });
      
      // Send notification
      if (result.userId) {
        await addDoc(collection(db, `users/${result.userId}/notifications`), {
          title: 'Result Published',
          message: `Your result for ${result.testTitle || 'a test'} has been published.`,
          type: 'info',
          createdAt: Date.now(),
          read: false
        });
      }
      
      toast.success('Result published successfully');
    } catch (err) {
      toast.error('Failed to publish result');
      console.error(err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleUnpublish = async (resultId: string) => {
    if (!window.confirm('Are you sure you want to unpublish this result?')) return;
    setPublishingId(resultId);
    try {
      await updateDoc(doc(db, 'results', resultId), {
        status: 'pending'
      });
      toast.success('Result unpublished');
    } catch (err) {
      toast.error('Failed to unpublish result');
      console.error(err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = async (resultId: string) => {
    if (!window.confirm('Are you sure you want to delete this result permanently?')) return;
    try {
      await deleteDoc(doc(db, 'results', resultId));
      toast.success('Result deleted');
    } catch (err) {
      toast.error('Failed to delete result');
      console.error(err);
    }
  };

  const filtered = results.filter(r => {
    if (activeTab === 'pending' && r.status !== 'pending') return false;
    if (activeTab === 'published' && r.status === 'pending') return false;

    const search = searchTerm.toLowerCase();
    const title = (r.testTitle || '').toLowerCase();
    const name = (r.userName || '').toLowerCase();
    const email = (r.userEmail || '').toLowerCase();
    const exam = (r.examName || '').toLowerCase();
    return title.includes(search) || name.includes(search) || email.includes(search) || exam.includes(search);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#5B5FFB]" />
            Result Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Review, publish, and manage student test results.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex bg-gray-100 dark:bg-[#151521] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'pending' ? 'bg-white dark:bg-[#1E1E2D] text-[#5B5FFB] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            Pending Results
          </button>
          <button
            onClick={() => setActiveTab('published')}
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${activeTab === 'published' ? 'bg-white dark:bg-[#1E1E2D] text-[#5B5FFB] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
          >
            Published Results
          </button>
        </div>

        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by student, email, test or exam name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#1E1E2D] border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Exam & Test</th>
                <th className="px-6 py-4">Score & %</th>
                <th className="px-6 py-4">Time Taken</th>
                <th className="px-6 py-4">Submitted At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB] mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No {activeTab} results found.
                  </td>
                </tr>
              ) : (
                filtered.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-white">{result.userName || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{result.userEmail || 'No Email'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-white line-clamp-1">{result.testTitle || 'Unknown Test'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{result.examName || 'Unknown Exam'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-[#5B5FFB]">{result.score?.toFixed(1)} / {result.totalMarks}</div>
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {((result.score / (result.totalMarks || 100)) * 100).toFixed(1)}% Accuracy
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {Math.floor((result.timeTaken || 0) / 60)}m {(result.timeTaken || 0) % 60}s
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {new Date(result.submittedAt || Date.now()).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400 ml-5">
                        {new Date(result.submittedAt || Date.now()).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/test-result/${result.testId}/${result.id}`)}
                          className="p-1.5 text-gray-400 hover:bg-blue-50 hover:text-[#5B5FFB] rounded-lg transition-colors"
                          title="View Result"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {activeTab === 'pending' ? (
                          <button
                            onClick={() => handlePublish(result)}
                            disabled={publishingId === result.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            {publishingId === result.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Publish
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUnpublish(result.id)}
                              disabled={publishingId === result.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                            >
                              {publishingId === result.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                              Unpublish
                            </button>
                            <button
                              onClick={() => handleDelete(result.id)}
                              className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                              title="Delete Result"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
