import React, { useState, useEffect } from 'react';
import { collectionGroup, query, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { HelpCircle, Search, Loader2, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminQuestionBank() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const q = query(collectionGroup(db, 'Questions'), limit(50));
        const snap = await getDocs(q);
        
        const qList = snap.docs.map(d => {
          const data = d.data();
          // Extract testId from path. Path format: tests/{testId}/Questions/{qId}
          const pathSegments = d.ref.path.split('/');
          const testId = pathSegments[1];
          return {
            id: d.id,
            testId,
            ...data
          };
        });
        
        setQuestions(qList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  const filtered = questions.filter(q => q.text?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1E1E2D] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#5B5FFB]" />
            Question Bank
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Centralized repository of all test questions across the platform.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search questions by text..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-[#151521] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#5B5FFB] outline-none text-gray-900 dark:text-white transition-colors"
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <Filter className="w-5 h-5" /> Filters
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>
      ) : (
        <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#151521] text-left">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject/Topic</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50 dark:hover:bg-[#F8FAFC] dark:bg-[#151521]/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white font-medium line-clamp-2" dangerouslySetInnerHTML={{ __html: q.text }} />
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">ID: {q.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{q.subject || '-'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{q.topic || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                        q.difficulty === 'Easy' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' :
                        q.difficulty === 'Hard' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                      }`}>
                        {q.difficulty || 'Medium'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => navigate(`/admin/tests/${q.testId}/questions`)}
                        className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-[#5B5FFB] hover:bg-blue-50 dark:hover:bg-[#5B5FFB]/10 rounded-lg transition-colors"
                        title="Go to Test Questions"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No questions found. Try adjusting your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
