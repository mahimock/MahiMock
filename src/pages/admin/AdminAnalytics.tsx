import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  Trophy,
  PieChart as PieIcon,
  Loader2,
  Filter,
  Download
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, getDocs, orderBy, limit, where } from 'firebase/firestore';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { format, subDays, startOfDay } from 'date-fns';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    revenue: 0,
    testsAttempted: 0
  });
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [popularExams, setPopularExams] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch User Stats
        const userSnap = await getDocs(collection(db, 'users'));
        const totalUsers = userSnap.size;
        
        // Fetch Results Stats
        const resultsSnap = await getDocs(collection(db, 'results'));
        const totalTests = resultsSnap.size;
        
        // Mock Revenue (since actual payments might be 0 in dev)
        const revenue = resultsSnap.size * 99; // Mock: ₹99 per test attempt revenue

        setStats({
          totalUsers,
          activeUsers: Math.floor(totalUsers * 0.4), // Mock 40% active
          revenue,
          testsAttempted: totalTests
        });

        // Daily Activity Mock Data
        const days = 7;
        const mockDaily = Array.from({ length: days }).map((_, i) => ({
          date: format(subDays(new Date(), days - 1 - i), 'MMM d'),
          users: Math.floor(Math.random() * 50) + 10,
          tests: Math.floor(Math.random() * 100) + 20,
          revenue: Math.floor(Math.random() * 5000) + 1000
        }));
        setDailyData(mockDaily);

        // Popular Exams Mock Data
        setPopularExams([
          { name: 'SSC CGL', value: 400 },
          { name: 'UPSC CSE', value: 300 },
          { name: 'SBI PO', value: 200 },
          { name: 'RRB NTPC', value: 150 },
          { name: 'Others', value: 100 },
        ]);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const COLORS = ['#5B5FFB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight italic">ANALYTICS HUB</h1>
            <p className="text-gray-500 font-medium">Monitoring platform growth and student performance metrics.</p>
         </div>
         <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 hover:bg-gray-50 transition-colors">
               <Calendar className="w-4 h-4" /> Last 30 Days
            </button>
            <button className="px-4 py-2 bg-[#111827] text-gray-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-colors">
               <Download className="w-4 h-4" /> Export Report
            </button>
         </div>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
         {[
           { label: 'Total Students', value: stats.totalUsers, icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-blue-600', trend: '+12%', isUp: true },
           { label: 'Revenue Generated', value: `₹${stats.revenue.toLocaleString()}`, icon: <DollarSign className="w-6 h-6" />, color: 'bg-green-50 text-green-600', trend: '+8%', isUp: true },
           { label: 'Tests Attempted', value: stats.testsAttempted, icon: <Target className="w-6 h-6" />, color: 'bg-purple-50 text-purple-600', trend: '+24%', isUp: true },
           { label: 'Engagement Rate', value: '42.5%', icon: <Activity className="w-6 h-6" />, color: 'bg-orange-50 text-orange-600', trend: '-2%', isUp: false },
         ].map((card, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all group"
           >
              <div className="flex justify-between items-start mb-4">
                 <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {card.icon}
                 </div>
                 <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${card.isUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {card.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.trend}
                 </div>
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h4 className="text-2xl font-black text-gray-900">{card.value}</h4>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
         {/* Main Chart */}
         <div className="lg:col-span-8 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="text-lg font-black text-gray-900">Revenue & Engagement</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Growth over the last 7 days</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-[#5B5FFB]"></div>
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenue</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                     <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tests</span>
                  </div>
               </div>
            </div>
            
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                     <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#5B5FFB" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#5B5FFB" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                     <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                        labelStyle={{ fontWeight: 800, color: '#111827' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#5B5FFB" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                     <Area type="monotone" dataKey="tests" stroke="#10B981" strokeWidth={3} fill="transparent" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution Chart */}
         <div className="lg:col-span-4 bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col">
            <h3 className="text-lg font-black text-gray-900 mb-2">Exams Distribution</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">Tests attempted per category</p>
            
            <div className="flex-1 min-h-[250px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={popularExams}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {popularExams.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>

            <div className="space-y-3 mt-6">
               {popularExams.map((exam, i) => (
                  <div key={i} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-xs font-bold text-gray-600">{exam.name}</span>
                     </div>
                     <span className="text-xs font-black text-gray-900">{exam.value}</span>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-lg font-black text-gray-900">Top Performing Students</h3>
               <button className="text-[10px] font-black text-[#5B5FFB] uppercase tracking-widest hover:underline transition-all">View All</button>
            </div>
            <div className="space-y-6">
               {[
                 { name: 'Aarav Sharma', rank: 1, score: '98.5%', avatar: 'AS' },
                 { name: 'Isha Gupta', rank: 2, score: '97.2%', avatar: 'IG' },
                 { name: 'Rohan Verma', rank: 3, score: '95.8%', avatar: 'RV' },
                 { name: 'Sanya Malhotra', rank: 4, score: '94.1%', avatar: 'SM' },
               ].map((student, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="w-6 h-6 bg-yellow-400 text-gray-900 dark:text-white rounded-full flex items-center justify-center text-[10px] font-black">
                          {student.rank}
                       </div>
                       <div className="w-10 h-10 bg-[#5B5FFB]/10 text-[#5B5FFB] rounded-xl flex items-center justify-center font-bold">
                          {student.avatar}
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#5B5FFB] transition-colors">{student.name}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Gold Tier Aspirant</p>
                       </div>
                    </div>
                    <div className="text-sm font-black text-gray-900">{student.score}</div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm">
            <h3 className="text-lg font-black text-gray-900 mb-8">Recent Subscriptions</h3>
            <div className="space-y-6">
               {[
                 { plan: 'UPSC Premium', user: 'Vikram Singh', amount: '₹14,999', status: 'Completed' },
                 { plan: 'SSC Monthly', user: 'Anjali Rae', amount: '₹1,499', status: 'Completed' },
                 { plan: 'Banking Bundle', user: 'Rahul Khanna', amount: '₹5,999', status: 'Pending' },
                 { plan: 'MTS Test Series', user: 'Neha Bajaj', amount: '₹499', status: 'Completed' },
               ].map((sub, i) => (
                 <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl">
                    <div className="flex gap-4">
                       <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                          <DollarSign className="w-5 h-5" />
                       </div>
                       <div>
                          <h4 className="text-sm font-bold text-gray-900">{sub.plan}</h4>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{sub.user}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-sm font-black text-gray-900">{sub.amount}</div>
                       <div className={`text-[9px] font-black uppercase tracking-widest ${sub.status === 'Completed' ? 'text-green-500' : 'text-orange-500'}`}>
                          {sub.status}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
