import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, FileQuestion, Clock, BarChart, FileText, CheckCircle, Calendar, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BookmarkButton from '../components/BookmarkButton';
import { format } from 'date-fns';
import SEO from '../components/SEO';

export default function TestSeries() {
  const { currentUser } = useAuth();
  const [tests, setTests] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'tests'), where('status', '==', 'Published'));
    const unsub = onSnapshot(q, (snap) => {
      setTests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch user's latest attempts for all tests
    const q = query(
      collection(db, 'results'),
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const latestAttempts: Record<string, any> = {};
      const allResults = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      
      // Sort by submittedAt desc
      allResults.sort((a: any, b: any) => (b.submittedAt || 0) - (a.submittedAt || 0));

      allResults.forEach(data => {
        if (!latestAttempts[data.testId]) {
          latestAttempts[data.testId] = {
            ...data,
            date: data.submittedAt ? new Date(data.submittedAt) : new Date()
          };
        }
      });
      setAttempts(latestAttempts);
    });

    return () => unsub();
  }, [currentUser]);

  return (
    <>
      <SEO 
        title="Premium Test Series | MahiMock" 
        description="Access premium mock tests for UPSC, SSC, Banking, and Railways. Boost your preparation with real-time analytics and All India Ranking."
        path="/test-series"
      />
      <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Test Series</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Practice with our full-length mock tests designed to match the real exam pattern and difficulty level.</p>
        </div>

        {loading ? (
          <div className="flex justify-center h-64 items-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" />
          </div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <FileQuestion className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No tests available yet</h2>
            <p className="text-gray-500">Check back later for new mock tests.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map(test => {
              const attempt = attempts[test.id];
              const percentage = attempt ? (attempt.score / (test.marks || 100)) * 100 : 0;
              
              return (
                <div key={test.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-50 flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-[#111827] text-gray-900 dark:text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        {test.type || test.examId || 'MOCK TEST'}
                      </div>
                      {test.isPremium && (
                        <div className="bg-gradient-to-r from-yellow-400 to-amber-600 text-gray-900 dark:text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-400/20">
                          PREMIUM
                        </div>
                      )}
                      {attempt && (
                        <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100">
                          <CheckCircle className="w-3 h-3" /> DONE
                        </div>
                      )}
                    </div>
                    <BookmarkButton itemId={test.id} itemType="Test" itemData={test} />
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#5B5FFB] transition-colors">{test.title}</h3>
                  <p className="text-xs text-gray-400 font-medium line-clamp-1 mb-6 uppercase tracking-widest">{test.category || 'General Preparation'}</p>
                  
                  {attempt ? (
                    <div className="bg-[#F8FAFC] rounded-[2rem] p-6 my-6 border border-gray-50 space-y-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                           <Target className="w-3.5 h-3.5" /> Best Score
                         </div>
                         <div className="text-sm font-black text-[#5B5FFB]">
                           {attempt.score.toFixed(1)} / {test.marks || 100}
                         </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${percentage >= 70 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                         <span className="text-gray-400">{percentage.toFixed(1)}% Accuracy</span>
                         <span className="text-gray-300">{format(attempt.submittedAt, 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 my-8 flex-1">
                      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100">
                         <FileText className="w-5 h-5 text-gray-400 mb-1" />
                         <span className="text-[10px] font-black text-gray-900">{test.questionsCount || 0} QS</span>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center justify-center border border-gray-100">
                         <Clock className="w-5 h-5 text-gray-400 mb-1" />
                         <span className="text-[10px] font-black text-gray-900">{test.durationMinutes || 60} MIN</span>
                      </div>
                    </div>
                  )}
  
                  <button 
                    onClick={() => navigate(`/test-instructions/${test.id}`)}
                    className={`w-full font-black py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl ${
                      attempt 
                      ? 'bg-white border-2 border-gray-100 text-[#5B5FFB] hover:border-[#5B5FFB] hover:bg-blue-50' 
                      : 'bg-[#5B5FFB] text-white shadow-[#5B5FFB]/20 hover:-translate-y-1'
                    }`}
                  >
                    {attempt ? 'REATTEMPT NOW' : (test.isPremium ? 'UNLOCK PREMIUM' : 'START PREPARATION')}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </>
);
}
