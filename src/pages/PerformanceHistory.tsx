import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, Clock, Target, Trophy, ChevronRight, Activity, Calendar, TrendingUp, BrainCircuit, BookOpen, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface Attempt {
  id: string;
  testId: string;
  testName: string;
  submittedAt: number;
  score: number;
  totalMarks: number;
  accuracy: number;
  rank: number;
  timeTaken: number; // in seconds, or derived
  status?: string;
}

export default function PerformanceHistory() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchHistory = async () => {
      try {
        const resQuery = query(
          collection(db, 'results'), 
          where('userId', '==', currentUser.uid)
        );
        const resSnap = await getDocs(resQuery);
        
        const allDocs = resSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as any));
        // Sort client-side to avoid index requirement
        allDocs.sort((a: any, b: any) => (b.submittedAt || 0) - (a.submittedAt || 0));

        const history: Attempt[] = allDocs.map(data => {
          return {
            id: data.id,
            testId: data.testId,
            testName: data.testTitle || 'Mock Test',
            submittedAt: data.submittedAt || 0,
            score: data.score || 0,
            totalMarks: data.totalMarks || 0,
            accuracy: data.accuracy || 0,
            rank: data.rank || 1,
            timeTaken: data.timeTaken || 0,
            status: data.status || 'published'
          };
        });
        
        setAttempts(history);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, [currentUser]);

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#12121A] min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white dark:bg-[#1E1E2D] shadow-sm border border-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance History</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">View your past test attempts and progress</p>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No attempts found</h2>
            <p className="text-gray-500 dark:text-gray-400">You haven't taken any tests yet.</p>
            <button onClick={() => navigate('/test-series')} className="mt-6 px-6 py-2.5 bg-[#5B5FFB] text-white font-bold rounded-xl hover:bg-[#4A4DE0] transition-colors shadow-sm">
              Explore Tests
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <div 
                key={attempt.id} 
                onClick={() => navigate(`/test-result/${attempt.testId}/${attempt.id}`)} 
                className="bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-[#5B5FFB] hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#5B5FFB] transition-colors mb-2">
                    {attempt.testName}
                  </h3>
                  {attempt.status === 'pending' ? (
                    <div className="text-orange-600 font-bold text-sm bg-orange-50 px-3 py-2 rounded-lg inline-block">Result Pending Approval</div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5 font-medium"><Calendar className="w-4 h-4 text-gray-400" /> {new Date(attempt.submittedAt).toLocaleString()}</span>
                      <span className="flex items-center gap-1.5 font-medium"><Target className="w-4 h-4 text-gray-400" /> {((attempt.score / (attempt.totalMarks || 100)) * 100).toFixed(1)}%</span>
                      <span className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-gray-400" /> {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                      <span className="flex items-center gap-1.5 font-bold text-emerald-600"><Trophy className="w-4 h-4" /> Rank: #{attempt.rank}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-8 sm:pl-6 sm:border-l border-gray-100 w-full sm:w-auto shrink-0">
                  {attempt.status === 'pending' ? (
                    <div className="text-center sm:text-right text-gray-400 w-full">
                      <Clock className="w-8 h-8 mx-auto sm:ml-auto opacity-50 mb-1" />
                      <div className="text-xs font-bold uppercase tracking-widest">Under Review</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-center sm:text-right">
                        <div className="text-2xl font-extrabold text-[#5B5FFB]">{attempt.score.toFixed(1)}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score</div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className={`text-2xl font-extrabold ${attempt.accuracy >= 70 ? 'text-green-600' : attempt.accuracy >= 40 ? 'text-orange-600' : 'text-red-600'}`}>
                          {attempt.accuracy.toFixed(1)}%
                        </div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accuracy</div>
                      </div>
                    </>
                  )}
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#5B5FFB] transition-colors hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
