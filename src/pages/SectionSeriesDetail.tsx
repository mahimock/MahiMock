import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, FileQuestion, BookOpen, Clock, AlertCircle, PlayCircle, Loader2, ChevronRight, Zap
} from 'lucide-react';
import * as Icons from 'lucide-react';

export default function SectionSeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [series, setSeries] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch series details
        const seriesDoc = await getDoc(doc(db, 'sectionSeries', id));
        if (!seriesDoc.exists()) {
          setSeries(null);
          setLoading(false);
          return;
        }
        setSeries({ id: seriesDoc.id, ...seriesDoc.data() });

        // Fetch tests for this section series
        const tQ = query(
          collection(db, 'tests'), 
          where('sectionSeriesId', '==', id),
          where('status', '==', 'Published')
        );
        const tSnap = await getDocs(tQ);
        const fetchedTests = tSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        fetchedTests.sort((a, b) => {
          const orderA = a.displayOrder ?? a.order ?? 0;
          const orderB = b.displayOrder ?? b.order ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          return (a.createdAt || 0) - (b.createdAt || 0);
        });
        setTests(fetchedTests);
      } catch (error) {
        console.error("Error fetching section details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white dark:bg-[#0B0D17]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-white dark:bg-[#0B0D17]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Section Not Found</h2>
          <button onClick={() => navigate(-1)} className="text-orange-500 hover:underline font-medium">Go Back</button>
        </div>
      </div>
    );
  }

  const IconComponent = (Icons as any)[series.iconName] || Zap;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0D17] text-gray-900 dark:text-white pt-24 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-white font-medium mb-12 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
        </button>
        
        <div className="flex items-center gap-8 mb-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl overflow-hidden">
            {series.logoUrl ? (
              <img loading="lazy" src={series.logoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <IconComponent className="w-12 h-12 text-orange-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] bg-orange-500/10 px-3 py-1 rounded-lg">Sectional Practice</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{series.name}</h1>
            <div className="flex items-center gap-4 mt-3 text-gray-400 font-medium">
               <span>{tests.length} Practice Tests</span>
               <div className="w-1 h-1 rounded-full bg-gray-800" />
               <span className="text-orange-500/80">Real Exam Pattern</span>
            </div>
          </div>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-[#111420] rounded-[3rem] border border-gray-200 dark:border-white/5 shadow-2xl">
            <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-3">No Tests Available</h3>
            <p className="text-gray-500 max-w-xs mx-auto">Our team is adding new high-yield practice tests for this section. Check back soon!</p>
          </div>
        ) : (
          <div className="flex overflow-x-auto pb-8 gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 snap-x snap-mandatory hide-scrollbar">
            {tests.map(test => (
              <div 
                key={test.id} 
                onClick={() => navigate(`/test-instructions/${test.id}`)}
                className="cursor-pointer shrink-0 w-[115px] h-[160px] md:w-auto md:h-auto snap-center group bg-white dark:bg-[#111420] rounded-2xl md:rounded-[2.5rem] p-3 md:p-8 border border-gray-200 dark:border-white/5 hover:border-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 relative overflow-hidden flex flex-col justify-between shadow-lg"
              >
                {/* Mobile UI */}
                <div className="md:hidden flex flex-col h-full justify-between relative z-10">
                  <div>
                    <h4 className="text-[11px] font-black line-clamp-3 leading-tight text-gray-900 dark:text-white mb-2 uppercase italic">{test.title}</h4>
                    <div className="flex flex-col gap-1.5 mt-auto">
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                        <FileQuestion className="w-2.5 h-2.5 text-orange-500" /> {test.questionsCount} Qs
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                        <Clock className="w-2.5 h-2.5 text-orange-500" /> {test.durationMinutes}m
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                        <Zap className="w-2.5 h-2.5 text-orange-500" /> {test.marks || (test.questionsCount * 1)} Marks
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] font-black text-orange-500 flex items-center gap-1 uppercase italic tracking-widest">
                    Start Test <ChevronRight className="w-3 h-3" />
                  </div>
                </div>

                {/* Desktop UI */}
                <div className="hidden md:block">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-colors" />
                  
                  <h4 className="text-2xl font-black mb-4 line-clamp-2 group-hover:text-orange-400 transition-colors leading-tight">{test.title}</h4>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-500 mb-8">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                      <FileQuestion className="w-4 h-4 text-orange-500" /> {test.questionsCount} Qs
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                      <Clock className="w-4 h-4 text-orange-500" /> {test.durationMinutes} Min
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5">
                       <Zap className="w-4 h-4 text-orange-500" /> {test.marks || (test.questionsCount * 1)} Marks
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/test-instructions/${test.id}`); }}
                    className="w-full py-4 rounded-2xl bg-white text-black font-black hover:bg-gray-200 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm relative z-10"
                  >
                    <PlayCircle className="w-5 h-5" /> Start Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
