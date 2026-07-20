import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  LayoutDashboard, 
  Trophy, 
  Activity, 
  Target, 
  Clock, 
  ChevronRight, 
  FileText, 
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { format } from 'date-fns';

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'results'),
      where('userId', '==', currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const allResults = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort client-side to avoid index requirement
      allResults.sort((a: any, b: any) => (b.submittedAt || 0) - (a.submittedAt || 0));
      setResults(allResults.slice(0, 20));
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const stats = useMemo(() => {
    const publishedResults = results.filter(r => r.status !== 'pending');
    if (publishedResults.length === 0) return [];
    
    const totalScore = publishedResults.reduce((acc, r) => acc + (r.score || 0), 0);
    const avgScore = (totalScore / publishedResults.length).toFixed(1);
    const totalAccuracy = publishedResults.reduce((acc, r) => acc + (r.accuracy || 0), 0);
    const avgAccuracy = (totalAccuracy / publishedResults.length).toFixed(1);
    const totalTests = publishedResults.length;
    
    return [
      { label: 'Avg Score', value: avgScore, icon: <Trophy className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600', trend: '+12%' },
      { label: 'Accuracy', value: `${avgAccuracy}%`, icon: <Target className="w-5 h-5" />, color: 'bg-green-50 text-green-600', trend: '+5%' },
      { label: 'Tests Taken', value: totalTests, icon: <FileText className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
      { label: 'Global Rank', value: '#42', icon: <Activity className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600', trend: '-3' },
    ];
  }, [results]);

  const chartData = useMemo(() => {
    return results.filter(r => r.status !== 'pending').slice().reverse().map(r => ({
      name: format(r.submittedAt, 'MMM d'),
      score: r.score,
      accuracy: r.accuracy
    }));
  }, [results]);

  const subjectData = useMemo(() => {
    const publishedResults = results.filter(r => r.status !== 'pending');
    if (publishedResults.length === 0) return [];
    
    const subjects: Record<string, { total: number, correct: number, score: number, color: string }> = {};
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-orange-500', 'bg-pink-500', 'bg-cyan-500'];
    let colorIdx = 0;

    publishedResults.forEach(r => {
      if (r.subjectAnalysis) {
        Object.entries(r.subjectAnalysis).forEach(([sub, data]: [string, any]) => {
          if (!subjects[sub]) {
            subjects[sub] = { total: 0, correct: 0, score: 0, color: colors[colorIdx % colors.length] };
            colorIdx++;
          }
          subjects[sub].total += data.total;
          subjects[sub].correct += data.correct;
          subjects[sub].score += data.score;
        });
      }
    });

    return Object.entries(subjects).map(([name, data]) => ({
      name,
      score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      color: data.color
    }));
  }, [results]);

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#12121A] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5B5FFB] rounded-xl flex items-center justify-center text-white">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              Student Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {userProfile?.name || 'Scholar'}! Here's your preparation summary.</p>
          </div>
          <Link 
            to="/test-series" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#5B5FFB] text-white font-bold rounded-2xl hover:bg-[#4A4DE0] transition-all shadow-lg shadow-[#5B5FFB]/20"
          >
            <Zap className="w-4 h-4 fill-current" /> Start New Test
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="bg-white dark:bg-[#1E1E2D] p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</span>
                {stat.trend && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} mb-1`}>
                    {stat.trend}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#1E1E2D] p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Performance Trend</h3>
                 <p className="text-xs text-gray-400 font-medium">Your score and accuracy over recent attempts</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#5B5FFB]"></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Score</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Accuracy</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5B5FFB" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#5B5FFB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94A3B8' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#5B5FFB" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                  <Area type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Analysis */}
          <div className="bg-white dark:bg-[#1E1E2D] p-6 rounded-3xl border border-gray-100 shadow-sm">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <BrainCircuit className="w-5 h-5 text-purple-600" /> Subject Analysis
             </h3>
             {subjectData.length === 0 ? (
               <div className="text-center py-8">
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No performance data available. Attempt a mock test to view analytics.</p>
               </div>
             ) : (
               <>
                 <div className="space-y-6">
                    {subjectData.map((subject) => (
                      <div key={subject.name}>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-gray-700">{subject.name}</span>
                          <span className="text-gray-400">{subject.score}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${subject.score}%` }}
                            className={`h-full ${subject.color}`}
                          ></motion.div>
                        </div>
                      </div>
                    ))}
                 </div>
                 
                 {subjectData.length > 0 && (
                   <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> Improvement Tip
                      </p>
                      <p className="text-[10px] text-purple-600 leading-relaxed font-medium">
                        {subjectData.sort((a, b) => a.score - b.score)[0]?.name ? `Focus more on ${subjectData[0].name} to balance your performance.` : 'Keep practicing to improve your scores!'}
                      </p>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>

        {/* Recent Tests Table */}
        <div className="bg-white dark:bg-[#1E1E2D] rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
             <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Attempts</h3>
             <Link to="/performance" className="text-xs font-bold text-[#5B5FFB] hover:underline">View All History</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Test Name</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4 text-center">Accuracy</th>
                  <th className="px-6 py-4 text-right">Date</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">No tests taken yet.</td>
                  </tr>
                ) : (
                  results.slice(0, 5).map((r) => (
                    <tr key={r.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#5B5FFB] group-hover:bg-[#5B5FFB] group-hover:text-white transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{r.testTitle || 'Mock Test'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.status === 'pending' ? (
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">Pending</span>
                        ) : (
                          <span className="text-sm font-bold text-gray-700">{r.score}/{r.totalMarks}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.status === 'pending' ? (
                          <span className="text-gray-400 text-xs">-</span>
                        ) : (
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${r.accuracy >= 80 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {r.accuracy}%
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-gray-400">{format(r.submittedAt, 'dd MMM, yyyy')}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/test-result/${r.testId}`} className="text-gray-300 hover:text-[#5B5FFB] transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
