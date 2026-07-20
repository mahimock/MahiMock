import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, GraduationCap, LayoutGrid, Zap, 
  ChevronRight, Play, Clock, ArrowRight, ArrowUpRight, Bell, User, Trophy,
  Star, FileText, CheckCircle, Activity, BarChart, Mic,
  Target, Globe, Briefcase, FileBadge, Key
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, limit, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import GlobalSearch from '../components/GlobalSearch';

interface SeriesItem {
  id: string;
  name: string;
  logoUrl?: string;
  iconName?: string;
  themeColor?: string;
  order?: number;
}


function CountUp({ value, suffix = "", className = "" }: { value: number, suffix?: string, className?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(ease * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span className={className}>{count}{suffix}</span>;
}

export default function Home() {
  const { currentUser } = useAuth();
  const [examCategories, setExamCategories] = useState<any[]>([]);
  const [allTests, setAllTests] = useState<any[]>([]);
  const [mockTests, setMockTests] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [subjectSeries, setSubjectSeries] = useState<SeriesItem[]>([]);
  const [sectionSeries, setSectionSeries] = useState<SeriesItem[]>([]);
  const [homeConfig, setHomeConfig] = useState<any>(null);
    const [allAttempts, setAllAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // Fetch Home Config
    const fetchConfig = async () => {
      const docSnap = await getDoc(doc(db, 'system', 'homeConfig'));
      if (docSnap.exists()) {
        setHomeConfig(docSnap.data());
      }
    };
    fetchConfig();

    // Fetch Categories
    const qCategories = query(collection(db, 'examCategories'));
    const unsubscribeCategories = onSnapshot(qCategories, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExamCategories(categories.filter(c => c.id !== '_init'));
    });

    // Fetch Subject Series
    const qSubject = query(collection(db, 'subjectSeries'), where('isActive', '==', true));
    const unsubscribeSubject = onSnapshot(qSubject, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeriesItem));
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSubjectSeries(items);
    });

    // Fetch Section Series
    const qSection = query(collection(db, 'sectionSeries'), where('isActive', '==', true));
    const unsubscribeSection = onSnapshot(qSection, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeriesItem));
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSectionSeries(items);
    });

    // Fetch Updates
    const qUpdates = query(collection(db, 'latestUpdates'), limit(4));
    const unsubscribeUpdates = onSnapshot(qUpdates, (snapshot) => {
      const fetchedUpdates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpdates(fetchedUpdates.filter(c => c.id !== '_init'));
    });

    // Fetch Tests
    const qTests = query(collection(db, 'tests'), where('status', '==', 'Published'), limit(10));
    const unsubscribeTests = onSnapshot(qTests, (snapshot) => {
      const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)).filter(c => c.id !== '_init');
      setAllTests(tests);
      setMockTests(tests);
    });

    // Fetch Last Attempt
    let unsubscribeResults: (() => void) | undefined;
    if (currentUser) {
      const qResults = query(
        collection(db, 'results'),
        where('userId', '==', currentUser.uid)
      );
      unsubscribeResults = onSnapshot(qResults, (snapshot) => {
        const allResults = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        allResults.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
        setAllAttempts(allResults);
        if (allResults.length > 0) {
                  }      });
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
      unsubscribeCategories();
      unsubscribeSubject();
      unsubscribeSection();
      unsubscribeUpdates();
      unsubscribeTests();
      if (unsubscribeResults) unsubscribeResults();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B18] flex flex-col items-center justify-center">
        <div className="w-16 h-16 relative flex items-center justify-center">
          <div className="absolute inset-0 border-t-2 border-[#6C4DFF] rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-r-2 border-indigo-500 rounded-full animate-spin-reverse"></div>
        </div>
      </div>
    );
  }

  // Compute Performance Statistics
  const totalAttempts = allAttempts.length;
  const overallScore = allAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
  
  let totalCorrect = 0;
  let totalAttemptedQuestions = 0;
  allAttempts.forEach(attempt => {
    totalCorrect += (attempt.correct || 0);
    totalAttemptedQuestions += ((attempt.correct || 0) + (attempt.incorrect || 0));
  });
  const overallAccuracy = totalAttemptedQuestions > 0 
    ? Math.round((totalCorrect / totalAttemptedQuestions) * 100) 
    : 0;

  const sparklineData = allAttempts.slice(0, 10).reverse().map(a => {
    const maxScore = a.totalMarks || a.totalQuestions || 1;
    return Math.max(0, Math.min(100, Math.round(((a.score || 0) / maxScore) * 100)));
  });

  const renderSparkline = () => {
    if (sparklineData.length < 2) return null;
    const width = 200;
    const height = 60;
    const points = sparklineData.map((val, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - (val / 100) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6C4DFF" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#6C4DFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${points} ${width},${height}`} fill="url(#sparkline-gradient)" />
        <polyline points={points} fill="none" stroke="#6C4DFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {sparklineData.map((val, i) => {
          const x = (i / (sparklineData.length - 1)) * width;
          const y = height - (val / 100) * height;
          return <circle key={i} cx={x} cy={y} r="3" fill="#111827" stroke="#6C4DFF" strokeWidth="2" />;
        })}
      </svg>
    );
  };

  return (
    <div className="bg-[#070B18] min-h-screen text-white selection:bg-[#6C4DFF]/30 selection:text-white pb-6 sm:pb-8 overflow-x-hidden font-sans">
      <SEO path="/" />

      {/* Premium Hero Section */}
      <section className="px-4 pt-4 max-w-7xl mx-auto">
        <div className="relative h-auto min-h-[220px] sm:h-[260px] w-full rounded-[24px] overflow-hidden bg-gradient-to-br from-[#1A1333] via-[#0A0D20] to-[#120822] shadow-[0_12px_30px_rgba(0,0,0,0.5)] border border-white/10 flex items-center group">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#6C4DFF]/20 blur-[70px] rounded-full pointer-events-none transition-all duration-700" />
          <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none transition-all duration-700" />
          
          <div className="relative z-10 flex w-full h-full p-[20px] sm:p-8 items-center">
            
            {/* Left Side (Text & Buttons) - 60% */}
            <div className="w-[60%] flex flex-col justify-center gap-2.5 sm:gap-4 z-20">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest w-fit backdrop-blur-md shadow-sm">
                <Star className="w-2.5 h-2.5 text-[#6C4DFF]" />
                #1 Government Exam Prep
              </div>
              
              <h1 className="text-[20px] sm:text-4xl font-extrabold text-white tracking-tight leading-[1.2] mt-1 sm:mt-0 drop-shadow-sm">
                {homeConfig?.heroHeading ? (
                  homeConfig.heroHeading.split('\n').map((line: string, i: number) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < homeConfig.heroHeading.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))
                ) : (
                  <>
                    Prepare Smarter.<br className="hidden sm:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8166FF] to-[#A392FF]">Achieve Faster.</span>
                  </>
                )}
              </h1>
              
              <p className="text-white/70 text-[11px] sm:text-[13px] font-medium leading-relaxed line-clamp-2 max-w-[95%]">
                {homeConfig?.heroDescription || "Crack SSC, Banking, Railways & State exams with real-time analytics."}
              </p>
              
              <div className="flex items-center gap-2.5 mt-2 w-full pr-2">
                <button 
                  onClick={() => navigate('/test-series')} 
                  className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-[#6C4DFF] to-[#5B3CE8] text-white text-[11px] sm:text-sm font-bold rounded-xl transition-all shadow-[0_4px_15px_rgba(108,77,255,0.4)] hover:shadow-[0_6px_20px_rgba(108,77,255,0.6)] hover:-translate-y-0.5 active:scale-95 text-center"
                >
                  Explore Tests
                </button>
                <button 
                  onClick={() => navigate('/study-materials')} 
                  className="flex-1 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] sm:text-sm font-bold rounded-xl transition-all backdrop-blur-md active:scale-95 whitespace-nowrap hover:border-white/20 text-center"
                >
                  Study Materials
                </button>
              </div>
            </div>

            {/* Right Side (Image) - 40% */}
            <div className="w-[40%] h-full flex items-center justify-center relative z-10 pl-2">
              <div className="absolute inset-0 bg-[#6C4DFF]/10 blur-[40px] rounded-full group-hover:bg-[#6C4DFF]/20 transition-colors duration-500" />
              {homeConfig?.heroImageUrl ? (
                <img 
                  src={homeConfig.heroImageUrl} 
                  alt="Hero" 
                  className="w-full h-auto max-h-[140px] sm:max-h-[200px] object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)] relative z-10 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-[80%] max-h-[140px] sm:max-h-[200px] bg-white/5 border border-white/10 rounded-[20px] flex flex-col items-center justify-center text-white/20 relative z-10 backdrop-blur-sm">
                  <LayoutGrid className="w-8 h-8 sm:w-12 sm:h-12 mb-2" />
                  <span className="text-[9px] sm:text-xs font-medium text-center px-2">Illustration</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Indicators */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            <div className="w-5 h-1.5 rounded-full bg-[#6C4DFF] shadow-[0_0_8px_rgba(108,77,255,0.6)] transition-all"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors cursor-pointer"></div>
          </div>
        </div>
      </section>

      {/* Floating Premium Search Bar */}
      <section className="px-4 mt-6 relative z-30 max-w-7xl mx-auto sticky top-[80px]">
        <div className="max-w-3xl mx-auto h-[56px] bg-[#12121A]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center w-full group overflow-hidden transition-all focus-within:border-[#6C4DFF]/50 focus-within:shadow-[0_0_20px_rgba(108,77,255,0.2)] focus-within:bg-[#151520]/95 relative">
           <GlobalSearch 
             placeholder="Search Exams, Subjects, Tests..." 
             className="w-full h-full relative"
             inputClassName="block w-full pl-[52px] pr-[52px] h-full bg-transparent border-none text-white focus:ring-0 placeholder-white/40 text-[15px] font-medium shadow-none outline-none rounded-[28px]" 
           />
        </div>
      </section>

      {/* Quick Access */}
      <section className="px-4 pt-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center gap-2 sm:gap-4 overflow-x-auto hide-scrollbar">
          {[
            { title: "Daily Quiz", icon: Target, iconColor: "text-emerald-400", path: "/daily-quiz" },
            { title: "Current Affairs", icon: Globe, iconColor: "text-purple-400", path: "/current-affairs" },
            { title: "Vacancies", icon: Briefcase, iconColor: "text-amber-400", path: "/vacancies" },
            { title: "Admit Card", icon: FileBadge, iconColor: "text-blue-400", path: "/admit-card" },
            { title: "Answer Key", icon: Key, iconColor: "text-rose-400", path: "/answer-key" },
          ].map((item, i) => (
            <Link 
              key={i} 
              to={item.path}
              className="flex-1 min-w-[70px] bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[18px] py-3 px-2 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/[0.06] hover:border-[#6C4DFF]/50 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.1)] group shrink-0"
            >
               <div className="w-[36px] h-[36px] rounded-[12px] bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <item.icon className={`w-5 h-5 ${item.iconColor}`} />
               </div>
               <span className="text-[10px] sm:text-[11px] font-bold text-white/90 text-center leading-tight">
                 {item.title}
               </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Exam Categories */}
      <section className="px-4 pt-6 sm:pt-8 max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-5">
          <h2 className="text-[18px] sm:text-[19px] font-bold text-white tracking-tight">Popular Exams</h2>
          <p className="text-[12px] sm:text-[13px] text-white/50 mt-0.5 sm:mt-1 font-medium">Choose your exam category</p>
        </div>
        
        {examCategories.length > 0 ? (
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth">
            {examCategories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => navigate(`/exams/${cat.slug || cat.id}`)}
                className="w-[110px] sm:w-[120px] min-w-[110px] sm:min-w-[120px] h-[110px] sm:h-[120px] bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[22px] p-3 sm:p-4 flex flex-col items-center justify-between cursor-pointer hover:bg-[#6C4DFF]/10 hover:border-[#6C4DFF]/50 hover:shadow-[0_0_15px_rgba(108,77,255,0.2)] active:scale-95 transition-all duration-300 group shrink-0 relative overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
                
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-[14px] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10 shrink-0">
                  {cat.logoUrl ? (
                    <img loading="lazy" src={cat.logoUrl} alt={cat.name} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                  ) : (
                    <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white/40" />
                  )}
                </div>
                
                <div className="flex flex-col items-center w-full relative z-10 gap-1 mt-1 sm:mt-2">
                  <span className="text-[11px] sm:text-[12px] font-bold text-white text-center line-clamp-1 leading-tight">{cat.name}</span>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#6C4DFF] transition-colors">
                    <ChevronRight className="w-3 h-3 text-white/50 group-hover:text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/10 rounded-[22px] p-8 text-center text-white/40 text-[13px] font-medium backdrop-blur-md">
            No Exams Available
          </div>
        )}
      </section>

      {/* Study by Subject */}
      <section className="px-4 pt-10 sm:pt-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">Study by Subject</h2>
            <p className="text-[12px] sm:text-[13px] text-white/50 mt-0.5 font-medium">Practice chapter-wise for every subject</p>
          </div>
          <button onClick={() => navigate('/subject-series')} className="text-[12px] sm:text-[13px] text-[#6C4DFF] font-bold hover:text-indigo-400 transition-colors whitespace-nowrap ml-2 shrink-0">View All &gt;</button>
        </div>
        
        {loading ? (
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-[150px] min-w-[150px] h-[190px] snap-center bg-white/[0.02] border border-white/5 rounded-[20px] shrink-0 animate-pulse flex flex-col p-4">
                 <div className="w-[44px] h-[44px] rounded-[16px] bg-white/5 mb-3" />
                 <div className="space-y-2 mt-2">
                   <div className="h-3 w-3/4 bg-white/5 rounded" />
                   <div className="h-2 w-1/2 bg-white/5 rounded" />
                 </div>
               </div>
             ))}
          </div>
        ) : subjectSeries.filter((s: any) => s.chapterCount !== 0 || s.testCount !== 0).length > 0 ? (
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {subjectSeries.filter((s: any) => s.chapterCount !== 0 || s.testCount !== 0).slice(0, 10).map((item, index) => {
              const bgGradients = [
                "from-blue-500/10 to-cyan-500/5",
                "from-purple-500/10 to-pink-500/5",
                "from-emerald-500/10 to-teal-500/5",
                "from-orange-500/10 to-amber-500/5",
                "from-indigo-500/10 to-blue-500/5",
                "from-rose-500/10 to-red-500/5",
              ];
              const iconColors = [
                "text-cyan-400 bg-cyan-400/20",
                "text-pink-400 bg-pink-400/20",
                "text-teal-400 bg-teal-400/20",
                "text-orange-400 bg-orange-400/20",
                "text-blue-400 bg-blue-400/20",
                "text-rose-400 bg-rose-400/20",
              ];
              
              const gradClass = bgGradients[index % bgGradients.length];
              const iconClass = iconColors[index % iconColors.length];
              const anyItem = item as any;

              return (
                <div 
                  key={item.id}
                  onClick={() => navigate(`/subject-series/${item.id}`)}
                  className={`w-[150px] min-w-[150px] h-[190px] snap-center bg-gradient-to-br ${gradClass} bg-[#0A0D1A] border border-white/5 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all duration-300 group flex flex-col shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-white/10 shrink-0`}
                >
                  <div className={`w-[44px] h-[44px] rounded-[16px] flex items-center justify-center ${iconClass} group-hover:scale-110 transition-transform duration-300 shrink-0 mb-3`}>
                    {item.logoUrl ? (
                      <img loading="lazy" src={item.logoUrl} alt={item.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <BookOpen className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div className="flex flex-col mb-auto">
                    <h3 className="text-[14px] font-bold text-white line-clamp-2 leading-tight mb-2">{item.name}</h3>
                    <div className="flex flex-col gap-1">
                      {anyItem.chapterCount != null && (
                        <span className="text-[11px] font-medium text-white/50">{anyItem.chapterCount} Chapters</span>
                      )}
                      {anyItem.testCount != null && (
                        <span className="text-[11px] font-medium text-white/50">{anyItem.testCount} Tests</span>
                      )}
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black text-white/70 transition-colors mt-2 self-start">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/10 rounded-[20px] p-8 text-center text-white/40 text-[13px] font-medium backdrop-blur-md">
            No Subjects Available
          </div>
        )}
      </section>

      {/* Sectional Tests */}
      <section className="px-4 pt-10 sm:pt-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">Sectional Tests</h2>
            <p className="text-[12px] sm:text-[13px] text-white/50 mt-0.5 font-medium">Focus on specific exam sections</p>
          </div>
          <button onClick={() => navigate('/section-series')} className="text-[12px] sm:text-[13px] text-[#6C4DFF] font-bold hover:text-indigo-400 transition-colors whitespace-nowrap ml-2 shrink-0">View All &gt;</button>
        </div>
        {loading ? (
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-[150px] min-w-[150px] h-[150px] snap-center bg-[#0A0D1A] border border-white/5 rounded-[20px] shrink-0 animate-pulse flex flex-col items-center justify-center p-4">
                 <div className="w-[48px] h-[48px] rounded-[16px] bg-white/5 mb-3" />
                 <div className="space-y-2 w-full flex flex-col items-center">
                   <div className="h-3 w-3/4 bg-white/5 rounded" />
                   <div className="h-2 w-1/2 bg-white/5 rounded" />
                 </div>
               </div>
             ))}
          </div>
        ) : sectionSeries.filter((s: any) => s.testCount !== 0).length > 0 ? (
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {sectionSeries.filter((s: any) => s.testCount !== 0).slice(0, 10).map((item, index) => {
              const bgGradients = [
                "from-orange-500/10 to-amber-500/5",
                "from-indigo-500/10 to-blue-500/5",
                "from-emerald-500/10 to-teal-500/5",
                "from-rose-500/10 to-red-500/5",
                "from-purple-500/10 to-pink-500/5",
                "from-blue-500/10 to-cyan-500/5",
              ];
              const iconColors = [
                "text-orange-400 bg-orange-400/20",
                "text-blue-400 bg-blue-400/20",
                "text-teal-400 bg-teal-400/20",
                "text-rose-400 bg-rose-400/20",
                "text-pink-400 bg-pink-400/20",
                "text-cyan-400 bg-cyan-400/20",
              ];
              
              const gradClass = bgGradients[index % bgGradients.length];
              const iconClass = iconColors[index % iconColors.length];
              const anyItem = item as any;

              return (
                <div 
                  key={item.id}
                  onClick={() => navigate(`/section-series/${item.id}`)}
                  className={`w-[150px] min-w-[150px] h-[150px] snap-center bg-gradient-to-br ${gradClass} bg-[#0A0D1A] border border-white/5 p-4 rounded-[20px] cursor-pointer active:scale-95 transition-all duration-300 group flex flex-col items-center justify-center text-center shrink-0 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:-translate-y-1 hover:border-white/10`}
                >
                  <div className={`w-[48px] h-[48px] rounded-[16px] flex items-center justify-center ${iconClass} group-hover:scale-110 transition-transform duration-300 mb-3`}>
                    {item.logoUrl ? (
                      <img loading="lazy" src={item.logoUrl} alt={item.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <Zap className="w-6 h-6" />
                    )}
                  </div>
                  <h3 className="text-[13px] font-bold text-white line-clamp-2 leading-tight w-full">{item.name}</h3>
                  {anyItem.testCount != null && (
                     <span className="text-[11px] font-medium text-white/50 mt-1.5">{anyItem.testCount} Tests</span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/10 rounded-[20px] p-8 text-center text-white/40 text-[13px] font-medium backdrop-blur-md">
            No Sectional Tests Available
          </div>
        )}
      </section>

      {/* Performance Summary */}
      <section className="px-4 pt-10 sm:pt-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">Performance Summary</h2>
          </div>
          <button onClick={() => navigate('/profile')} className="text-[12px] sm:text-[13px] text-[#6C4DFF] font-bold hover:text-indigo-400 transition-colors whitespace-nowrap ml-2 shrink-0">View All &gt;</button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#111827] rounded-[20px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-white/5 relative overflow-hidden"
        >
          {totalAttempts > 0 ? (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 flex items-center justify-between">
                <div className="flex flex-col items-center flex-1 text-center">
                  <CountUp value={totalAttempts} className="text-2xl sm:text-3xl font-bold text-white mb-1" />
                  <span className="text-[11px] sm:text-[12px] font-medium text-white/50">Tests Attempted</span>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="flex flex-col items-center flex-1 text-center">
                  <CountUp value={overallAccuracy} suffix="%" className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1" />
                  <span className="text-[11px] sm:text-[12px] font-medium text-white/50">Accuracy</span>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="flex flex-col items-center flex-1 text-center">
                  <CountUp value={Math.round(overallScore)} className="text-2xl sm:text-3xl font-bold text-[#6C4DFF] mb-1" />
                  <span className="text-[11px] sm:text-[12px] font-medium text-white/50">Overall Score</span>
                </div>
              </div>
              
              {sparklineData.length > 1 && (
                <div className="lg:w-[240px] h-[70px] lg:h-auto flex items-end mt-2 lg:mt-0 lg:border-l lg:border-white/10 lg:pl-6">
                  {renderSparkline()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-white/60 text-sm font-medium">Complete a test to view your performance.</p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Latest Mock Tests */}
      <section className="px-4 pt-10 sm:pt-12 max-w-7xl mx-auto pb-4">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">Latest Mock Tests</h2>
          </div>
          <button onClick={() => navigate('/test-series')} className="text-[12px] sm:text-[13px] text-[#6C4DFF] font-bold hover:text-indigo-400 transition-colors whitespace-nowrap ml-2 shrink-0">View All &gt;</button>
        </div>
        
        {mockTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {mockTests.slice(0, 6).map((item) => (
              <div 
                key={item.id}
                onClick={() => navigate(`/test-instructions/${item.id}`)}
                className="min-h-[92px] h-auto bg-[#12121A] border border-white/5 rounded-[18px] p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-white/[0.04] hover:border-white/10 transition-all shadow-[0_4px_15px_rgba(0,0,0,0.1)] group relative overflow-hidden"
              >
                <div className="w-[56px] h-[56px] rounded-[16px] bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6 text-indigo-400" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-white mb-1.5 line-clamp-2 leading-tight group-hover:text-[#6C4DFF] transition-colors">{item.title}</h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] sm:text-[12px] text-white/50 font-medium">
                    {item.totalQuestions ? <span className="flex items-center gap-1.5 whitespace-nowrap"><FileText className="w-3.5 h-3.5 text-white/40" /> {item.totalQuestions} Qs</span> : null}
                    {item.duration ? <span className="flex items-center gap-1.5 whitespace-nowrap"><Clock className="w-3.5 h-3.5 text-white/40" /> {item.duration}m</span> : null}
                    {item.difficulty ? <span className="flex items-center gap-1.5 whitespace-nowrap"><Activity className="w-3.5 h-3.5 text-white/40" /> {item.difficulty}</span> : null}
                    {item.attemptsCount ? <span className="flex items-center gap-1.5 whitespace-nowrap"><User className="w-3.5 h-3.5 text-white/40" /> {item.attemptsCount}</span> : null}
                  </div>
                </div>
                
                <button className="px-4 py-2 sm:px-5 sm:py-2.5 bg-[#6C4DFF] hover:bg-indigo-500 text-white text-[12px] sm:text-[13px] font-bold rounded-full transition-colors shrink-0 shadow-lg shadow-indigo-500/20 active:scale-95">
                  Start
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#12121A] border border-white/10 rounded-[20px] p-8 text-center text-white/40 text-[13px] font-medium backdrop-blur-md">
            No Mock Tests Published
          </div>
        )}
      </section>

{/* Current Updates */}
      <section className="px-4 pt-6 sm:pt-8 pb-0 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-4 sm:mb-5">
          <div>
            <h2 className="text-[18px] sm:text-[19px] font-bold text-white tracking-tight">Current Updates</h2>
            <p className="text-[12px] sm:text-[13px] text-white/50 mt-0.5 sm:mt-1 font-medium">Latest notifications and news</p>
          </div>
          <button onClick={() => navigate('/updates')} className="text-[12px] sm:text-[13px] text-[#6C4DFF] font-bold hover:text-indigo-400 transition-colors mb-0.5 whitespace-nowrap ml-2 shrink-0">View All &gt;</button>
        </div>
        {updates.length > 0 ? (
          <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0">
            {updates.map((update, index) => {
               const colors = [
                 "text-blue-400 bg-blue-400/20 border-blue-400/30",
                 "text-purple-400 bg-purple-400/20 border-purple-400/30",
                 "text-emerald-400 bg-emerald-400/20 border-emerald-400/30",
                 "text-orange-400 bg-orange-400/20 border-orange-400/30"
               ];
               const iconClass = colors[index % colors.length];
               
               return (
                <div 
                  key={update.id}
                  onClick={() => navigate('/updates')}
                  className="w-[280px] min-w-[280px] snap-center bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-[20px] p-4 flex gap-4 cursor-pointer hover:bg-white/[0.06] hover:border-[#6C4DFF]/30 active:scale-95 transition-all shrink-0 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#6C4DFF]/5 blur-[30px] rounded-full pointer-events-none group-hover:bg-[#6C4DFF]/10 transition-colors" />
                  
                  <div className={`w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0 border ${iconClass} relative z-10 group-hover:scale-110 transition-transform`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-white text-[14px] line-clamp-1 mb-0.5 leading-tight group-hover:text-[#6C4DFF] transition-colors">{update.title}</h3>
                    <p className="text-[11px] text-white/50 line-clamp-2 leading-snug">{update.description}</p>
                  </div>
                </div>
               );
            })}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/10 rounded-[20px] p-8 text-center text-white/40 text-[13px] font-medium backdrop-blur-md">
            No Notifications Available
          </div>
        )}
      </section>

    </div>
  );
}
