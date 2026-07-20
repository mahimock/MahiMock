import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ChevronRight, BookOpen, Search, ArrowRight } from 'lucide-react';
import { ExamLogo } from '../components/ExamLogo';
import SEO from '../components/SEO';

interface Exam {
  id: string;
  category: string;
  examName: string;
  slug: string;
  logo?: string;
  logoUrl?: string;
  isActive: boolean;
  displayOrder?: number;
}

export default function CategoryTestSeries() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { currentUser } = useAuth();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [examStats, setExamStats] = useState<Record<string, { total: number, completed: number }>>({});
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!categorySlug) return;
    
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch category info
        let catSnapshot = await getDocs(query(collection(db, 'examCategories'), where('slug', '==', categorySlug)));
        let catData = null;
        let catId = null;
        if (!catSnapshot.empty) {
          catData = catSnapshot.docs[0].data();
          catId = catSnapshot.docs[0].id;
        } else {
          const docRef = doc(db, 'examCategories', categorySlug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            catData = docSnap.data();
            catId = docSnap.id;
          }
        }
        
        if (catData) {
          const catName = catData.name || catData.category;
          setCategoryInfo({
            id: catId,
            name: catName,
            slug: catData.slug || categorySlug,
            logo: catData.logoUrl || catData.logo || ''
          });
          
          // Subscribe to exams
          const q = query(collection(db, 'exams'), where('isActive', '==', true));
          
          const unsubExams = onSnapshot(q, (snapshot) => {
            const fetchedExams: Exam[] = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              if (data.category === catName || data.category === catId || data.categoryId === catId || data.categorySlug === catData?.slug || data.category === catData?.slug) {
                fetchedExams.push({ id: doc.id, ...data } as Exam);
              }
            });
            fetchedExams.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setExams(fetchedExams);
            setLoading(false);
          });

          // Subscribe to results for progress
          let unsubResults: (() => void) | undefined;
          if (currentUser) {
            const qResults = query(
              collection(db, 'results'),
              where('userId', '==', currentUser.uid)
            );
            unsubResults = onSnapshot(qResults, (snapshot) => {
              const latestAttempts: Record<string, any> = {};
              snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (!latestAttempts[data.testId]) {
                  latestAttempts[data.testId] = data;
                }
              });
              setAttempts(latestAttempts);
            });
          }

          return () => {
            unsubExams();
            if (unsubResults) unsubResults();
          };
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching category test series:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [categorySlug, currentUser]);

  useEffect(() => {
    if (exams.length === 0) return;
    
    const fetchTests = async () => {
      const stats: Record<string, { total: number, completed: number }> = {};
      try {
        const q = query(collection(db, 'tests'), where('status', '==', 'Published'));
        const snapshot = await getDocs(q);
        
        snapshot.docs.forEach(doc => {
          const test = doc.data();
          const examId = test.examId;
          if (examId) {
            if (!stats[examId]) stats[examId] = { total: 0, completed: 0 };
            stats[examId].total++;
            if (attempts[doc.id]) {
              stats[examId].completed++;
            }
          }
        });
        setExamStats(stats);
      } catch (err) {
        console.error('Error fetching tests for stats:', err);
      }
    };

    fetchTests();
  }, [exams, attempts]);

  const filteredExams = exams.filter(exam => 
    exam.examName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B1B22] flex flex-col items-center justify-center text-gray-900 dark:text-white">
        <Loader2 className="w-12 h-12 animate-spin text-[#7C5CFF] mb-4" />
        <p className="font-bold tracking-widest uppercase text-xs">Loading Test Series</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1B22] min-h-screen text-gray-900 dark:text-white font-sans">
      <SEO 
        title={`${categoryInfo?.name || 'Category'} Test Series | MahiMock`} 
        description={`Explore all premium test series for ${categoryInfo?.name || 'the selected category'}.`}
      />

      {/* Breadcrumbs */}
      <div className="bg-[#1B1B22]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center text-sm">
          <Link to="/" className="text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-900 dark:text-white/10" />
          <Link to="/exams" className="text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">Exams</Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-900 dark:text-white/10" />
          <span className="text-gray-900 dark:text-white font-semibold">{categoryInfo?.name || 'Category'} Test Series</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#7C5CFF] text-[10px] font-bold uppercase tracking-widest mb-4">
              Premium Practice Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              All {categoryInfo?.name} <span className="text-[#7C5CFF]">Test Series</span>
            </h1>
            <p className="text-[#B8B8C8] text-lg max-w-2xl leading-relaxed">
              Explore our complete collection of premium practice tests designed for your success.
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group shadow-2xl">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-900 dark:text-white/30 group-focus-within:text-[#7C5CFF] transition-colors" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-14 pr-6 py-4.5 border border-gray-200 dark:border-white/10 rounded-[22px] leading-5 bg-gray-100 dark:bg-white/5 backdrop-blur-xl placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/50 focus:border-[#7C5CFF]/50 text-gray-900 dark:text-white transition-all text-sm" 
              placeholder={`Search ${categoryInfo?.name || ''} exams...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="bg-gray-100 dark:bg-white/5 rounded-[40px] p-20 text-center border border-gray-200 dark:border-white/5 shadow-2xl">
            <BookOpen className="w-20 h-20 text-gray-900 dark:text-white/5 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Mock Tests Published</h3>
            <p className="text-[#B8B8C8] max-w-md mx-auto">Try adjusting your search or check back later for new premium content added by our experts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
            {filteredExams.map((exam) => {
              const stats = examStats[exam.id] || { total: 0, completed: 0 };
              const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
              
              return (
                <Link 
                  to={`/${categorySlug}/${exam.slug}`}
                  key={exam.id}
                  className="block h-full min-h-[220px] rounded-[24px] p-6 flex flex-col shadow-2xl hover:shadow-[0_20px_60px_rgba(124,92,255,0.2)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group bg-gradient-to-br from-[#4A356C] to-[#2F2944] border border-gray-200 dark:border-white/10"
                >
                  <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 backdrop-blur-[1px] pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-125 duration-700"></div>
                  
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl p-1.5 overflow-hidden mb-5 relative z-10 shrink-0 border-2 border-gray-300 dark:border-white/20 group-hover:rotate-6 transition-all duration-500">
                    <ExamLogo logo={exam.logoUrl || exam.logo} name={exam.examName} />
                  </div>
                  
                  <div className="flex flex-col flex-1 relative z-10">
                    <h3 className="font-bold text-gray-900 dark:text-white text-[16px] sm:text-[18px] leading-tight mb-2 drop-shadow-md transition-transform group-hover:translate-x-1 duration-500 line-clamp-2">
                      {exam.examName}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[#B8B8C8] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/5">
                        {categoryInfo?.name}
                      </span>
                    </div>
                    
                    {progress > 0 && (
                      <div className="mt-auto mb-5">
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
                          <div 
                            className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#A78BFF] rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(124,92,255,0.4)]" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between w-full h-10 px-4 rounded-xl bg-gray-200 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-bold text-[12px] group-hover:bg-[#7C5CFF] group-hover:border-[#7C5CFF] transition-all duration-300">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
