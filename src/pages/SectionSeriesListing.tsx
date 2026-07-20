import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export default function SectionSeriesListing() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'popular' | 'new'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const q = query(collection(db, 'sectionSeries'), where('isActive', '==', true));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
          items.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          // Get test counts for each
          const seriesWithCounts = await Promise.all(items.map(async (item) => {
             const testsQ = query(collection(db, 'tests'), where('sectionSeriesId', '==', item.id), where('status', '==', 'Published'));
             const testsSnap = await getDocs(testsQ);
             return { ...item, totalTests: testsSnap.size };
          }));
          
          setSeries(seriesWithCounts);
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching section series:", error);
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  const filteredSeries = series.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white dark:bg-[#0B0D17]">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-24 bg-white dark:bg-[#0B0D17] text-gray-900 dark:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium mb-12 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-3">
              Sectional Mastery
            </div>
            <h1 className="text-4xl font-black tracking-tight">Section Tests</h1>
            <p className="text-gray-400 mt-2 max-w-xl">Sharpen your skills in specific sections like Reasoning, Quant, and English with dedicated daily practice tests.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative group flex-1 sm:w-80">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-orange-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search sections..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#111420] border border-gray-200 dark:border-white/5 rounded-2xl outline-none focus:border-orange-500/50 transition-all font-medium text-sm"
              />
            </div>
            <div className="flex bg-white dark:bg-[#111420] p-1.5 rounded-2xl border border-gray-200 dark:border-white/5">
              {(['all', 'popular', 'new'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-orange-600 text-gray-900 dark:text-white shadow-lg shadow-orange-500/20' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredSeries.length > 0 ? (
          <div className="flex overflow-x-auto pb-6 gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 snap-x snap-mandatory hide-scrollbar">
            {filteredSeries.map((item, index) => {
              const IconComponent = (Icons as any)[item.iconName] || Zap;
              const tColor = item.themeColor || 'orange';
              
              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/section-series/${item.id}`)}
                  className="shrink-0 w-[90px] h-[120px] sm:w-auto sm:h-auto snap-center group relative bg-white dark:bg-[#111420] p-3 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-gray-200 dark:border-white/5 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer transition-all duration-500 overflow-hidden flex flex-col items-center sm:items-start shadow-lg"
                >
                  <div className={`absolute inset-0 bg-${tColor}-500/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-${tColor}-500/10 text-${tColor}-400 flex items-center justify-center mb-3 sm:mb-6 transform group-hover:-translate-y-1 group-hover:scale-110 transition-all duration-300 relative z-10 overflow-hidden shadow-sm`}>
                    {item.logoUrl ? (
                      <img loading="lazy" src={item.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <IconComponent className="w-5 h-5 sm:w-8 sm:h-8" />
                    )}
                  </div>
                  
                  <h3 className="text-[10px] sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 relative z-10 group-hover:translate-x-1 transition-transform text-center sm:text-left line-clamp-1 w-full uppercase italic tracking-tight">{item.name}</h3>
                  <p className="text-[8px] sm:text-sm text-gray-400 font-bold uppercase tracking-widest relative z-10 text-center sm:text-left">
                    {item.totalTests} {item.totalTests === 1 ? 'Test' : 'Tests'}
                  </p>

                  <div className="hidden sm:flex flex-wrap gap-2 mt-4 relative z-10">
                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 px-2 py-1 rounded-lg text-gray-500">Daily Quiz</span>
                    <span className="text-[10px] font-bold bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 px-2 py-1 rounded-lg text-gray-500">Speed Test</span>
                  </div>
                  
                  <button className="hidden sm:flex w-full py-3 mt-6 rounded-xl bg-gray-100 dark:bg-white/5 group-hover:bg-orange-600 group-hover:text-gray-900 dark:hover:text-white text-gray-300 text-sm font-bold transition-all relative z-10 items-center justify-center gap-2">
                    Start Practice <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
           <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10 mx-4 sm:mx-6 lg:mx-8">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                 <BookOpen className="w-10 h-10 text-gray-400 dark:text-white/20" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Sectional Tests Available</h3>
              <p className="text-gray-500 dark:text-white/40 font-medium">Try adjusting your search query or check back later.</p>
           </div>
        )}
      </div>
    </div>
  );
}
