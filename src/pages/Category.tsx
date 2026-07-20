import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ChevronRight, Loader2, Plus, Edit2, Trash2, X, Image as ImageIcon, Shield, BarChart3, Target, Trophy, Clock, Zap, BookOpen, ArrowRight, HelpCircle, ChevronDown, Bell } from 'lucide-react';
import { collection, query, where, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ExamLogo } from '../components/ExamLogo';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import SingleExamsCarousel from '../components/SingleExamsCarousel';

interface Exam {
  id: string;
  category: string;
  examName: string;
  shortName?: string;
  slug: string;
  description?: string;
  logo?: string;
  logoUrl?: string;
  isActive: boolean;
  notificationLink?: string;
  officialWebsite?: string;
  appStartDate?: string;
  lastDate?: string;
  examDate?: string;
  admitCardDate?: string;
  resultDate?: string;
  eligibility?: string;
  ageLimit?: string;
  applicationFee?: string;
  displayOrder?: number;
}

interface CategoryInfo {
  id?: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
}

interface Update {
  id: string;
  title: string;
  tag?: string;
  date?: any;
  link?: string;
}

export default function Category() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { currentUser, userProfile } = useAuth();
  
  const isAdmin = Boolean(currentUser && userProfile?.role === 'admin');

  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo>({
    name: categorySlug?.toUpperCase() || 'Category',
    slug: categorySlug || '',
    logo: '',
    description: 'Explore exams in this category.'
  });
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [examStats, setExamStats] = useState<Record<string, { total: number, completed: number }>>({});
  const [attempts, setAttempts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updates, setUpdates] = useState<Update[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    examName: '',
    shortName: '',
    slug: '',
    logo: '',
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    if (!categorySlug) return;
    
    setLoading(true);
    let unsubscribeExams: () => void;
    let unsubscribeUpdates: () => void;

    const fetchCategoryAndExams = async () => {
      try {
        // Fetch category info
        const catQuery = query(collection(db, 'examCategories'), where('slug', '==', categorySlug));
        let catSnapshot = await getDocs(catQuery);
        
        let catData = null;
        let catId = null;
        if (!catSnapshot.empty) {
          catData = catSnapshot.docs[0].data();
          catId = catSnapshot.docs[0].id;
        } else {
          // fallback to ID
          const docRef = doc(db, 'examCategories', categorySlug);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            catData = docSnap.data();
            catId = docSnap.id;
          }
        }
        
        let catName = categoryInfo.name;
        if (catData) {
          catName = catData.name || catData.category || catData.name;
          setCategoryInfo({
            id: catId,
            name: catName,
            slug: catData.slug || categorySlug,
            description: catData.description || 'Explore exams in this category.',
            logo: catData.logoUrl || catData.logo || ''
          });
        }

        // Subscribe to exams for this category
                // Subscribe to exams for this category
        // In case they were saved with category ID, slug or name:
        const q = query(
          collection(db, 'exams')
        );
        console.log("DEBUG Category:", {
          SelectedCategorySlug: categorySlug,
          ResolvedCategoryName: catName
        });
        
                unsubscribeExams = onSnapshot(q, (snapshot) => {
          const fetchedExams: Exam[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Match any: name, id, slug
            if (data.category === catName || data.category === catId || data.categoryId === catId || data.categorySlug === (catData?.slug || categorySlug) || data.category === (catData?.slug || categorySlug)) {
              fetchedExams.push({ id: doc.id, ...data } as Exam);
            }
          });
          console.log("DEBUG Exams query snapshot size:", snapshot.size);
          console.log("DEBUG Fetched Exams:", fetchedExams);
          
          fetchedExams.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          
          if (!isAdmin) {
             setExams(fetchedExams.filter(e => e.isActive !== false));
          } else {
             setExams(fetchedExams);
          }
          setLoading(false);
        });

        // Subscribe to updates for this category
        const qUpdates = query(
          collection(db, 'updates'),
          orderBy('date', 'desc'),
          limit(5)
        );
        
        unsubscribeUpdates = onSnapshot(qUpdates, (snapshot) => {
          const fetchedUpdates: Update[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Basic filtering for category in title or tag
            if (
              data.title?.toLowerCase().includes(catName.toLowerCase()) || 
              data.tag?.toLowerCase().includes(catName.toLowerCase()) ||
              catName.toLowerCase().includes('ssc') // Special case for SSC if tag is short
            ) {
              fetchedUpdates.push({ id: doc.id, ...data } as Update);
            }
          });
          setUpdates(fetchedUpdates);
        });

        // Subscribe to results for progress
        let unsubscribeResults: (() => void) | undefined;
        if (currentUser) {
          const qResults = query(
            collection(db, 'results'),
            where('userId', '==', currentUser.uid)
          );
          unsubscribeResults = onSnapshot(qResults, (snapshot) => {
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
          if (unsubscribeResults) unsubscribeResults();
        };

      } catch (err: any) {
        console.error('Error fetching exams:', err);
        setLoading(false);
      }
    };

    fetchCategoryAndExams();

    return () => {
      if (unsubscribeExams) unsubscribeExams();
      if (unsubscribeUpdates) unsubscribeUpdates();
    };
  }, [categorySlug, isAdmin]);

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

  const handleOpenModal = (exam?: Exam) => {
    if (exam) {
      setLogoPreview(exam.logoUrl || exam.logo || '');
      setEditingExam(exam);
      setFormData({
        examName: exam.examName || '',
        shortName: exam.shortName || '',
        slug: exam.slug || '',
        logo: exam.logo || '',
        isActive: exam.isActive !== false,
        displayOrder: exam.displayOrder || 0
      });
    } else {
      setLogoPreview(categoryInfo.logo || '');
      setEditingExam(null);
      setFormData({
        examName: '',
        shortName: '',
        slug: '',
        logo: categoryInfo.logo,
        isActive: true,
        displayOrder: exams.length
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExam(null);
    setLogoPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      let finalLogoUrl = formData.logo || '';
      if (logoPreview && logoPreview !== categoryInfo.logo && logoPreview !== editingExam?.logoUrl && logoPreview !== editingExam?.logo) {
        finalLogoUrl = logoPreview;
      } else if (editingExam?.logoUrl) {
        finalLogoUrl = editingExam.logoUrl;
      }
      const rawExamData = { ...formData, logoUrl: finalLogoUrl };
      const examData = Object.fromEntries(Object.entries(rawExamData).filter(([_, v]) => v !== undefined));
      if (editingExam) {
        const docRef = doc(db, 'exams', editingExam.id);
        await updateDoc(docRef, examData);
        toast.success('Exam updated successfully');
      } else {
        await addDoc(collection(db, 'exams'), { ...examData, category: categoryInfo.name });
        toast.success('Exam created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving document: ", error);
      toast.error(error.message || 'Failed to save exam');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (exam: Exam) => setExamToDelete(exam);
  const cancelDelete = () => setExamToDelete(null);

  const handleDelete = async () => {
    if (!examToDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'exams', examToDelete.id));
      toast.success('Exam deleted successfully');
      setExamToDelete(null);
    } catch (error: any) {
      console.error("Error deleting document: ", error);
      toast.error('Failed to delete exam');
    } finally {
      setDeleting(false);
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.examName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (exam.shortName && exam.shortName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const FAQS = [
    {
      q: `How often are new ${categoryInfo.name} tests added?`,
      a: `We add new ${categoryInfo.name} mock tests weekly to ensure our students are practicing with the latest patterns and questions.`
    },
    {
      q: "Can I take the tests on mobile?",
      a: "Yes, our platform is fully responsive and optimized for a seamless experience on smartphones and tablets."
    },
    {
      q: "Is there a ranking system for the mock tests?",
      a: "Absolutely! After every full-length mock test, you'll receive an All India Rank to see where you stand among thousands of aspirants."
    },
    {
      q: "Do I get detailed solutions for the questions?",
      a: "Yes, every question comes with a step-by-step detailed explanation to help you understand the concept and avoid mistakes."
    }
  ];

  return (
    <div className="bg-[#1B1B22] min-h-screen text-gray-900 dark:text-white font-sans selection:bg-[#7C5CFF]/30">
      {/* Premium Header/Breadcrumbs */}
      <div className="bg-[#1B1B22]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <Link to="/" className="text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-900 dark:text-white/10" />
            <Link to="/exams" className="text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">Exams</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-900 dark:text-white/10" />
            <span className="text-gray-900 dark:text-white font-semibold">{categoryInfo.name}</span>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1B1B22]"></span>
             </button>
             {isAdmin && (
               <button 
                 onClick={() => handleOpenModal()}
                 className="flex items-center gap-1.5 bg-[#7C5CFF] text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-[#6D4AE0] transition-all shadow-lg shadow-[#7C5CFF]/20"
               >
                 <Plus className="w-4 h-4" /> Add Exam
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Modern Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Animated Glow Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7C5CFF]/20 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#4A356C]/30 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
            <div className="w-28 h-28 md:w-40 md:h-40 rounded-[40px] bg-white shadow-2xl flex flex-shrink-0 items-center justify-center p-6 border-4 border-gray-200 dark:border-white/10 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              <ExamLogo logo={categoryInfo.logo} name={categoryInfo.name} />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 text-[#7C5CFF] text-[10px] font-bold uppercase tracking-widest mb-4">
                <Shield className="w-3 h-3" /> Certified Preparation Partner
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 drop-shadow-xl leading-tight">
                {categoryInfo.name} <span className="text-[#7C5CFF]">Test Series</span>
              </h1>
              <p className="text-xl text-[#B8B8C8] mb-10 max-w-2xl leading-relaxed">
                {categoryInfo.description || `Crack the ${categoryInfo.name} exam with India's most comprehensive mock test series designed by top experts.`}
              </p>
              
              <div className="relative max-w-lg mx-auto md:mx-0 group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-900 dark:text-white/30 group-focus-within:text-[#7C5CFF] transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-14 pr-6 py-5 border border-gray-200 dark:border-white/10 rounded-[20px] bg-gray-100 dark:bg-white/5 backdrop-blur-xl placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]/50 focus:border-[#7C5CFF]/50 text-gray-900 dark:text-white transition-all text-base shadow-2xl" 
                  placeholder={`Search for your target exam...`} 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Carousel Section */}
      <section className="py-20 relative bg-[#1B1B22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Available Test Series</h2>
              <p className="text-[#B8B8C8] text-sm font-medium mt-2 uppercase tracking-[0.2em]">Latest Exam Patterns Included</p>
            </div>
            <Link to={`/test-series/${categorySlug}`} className="text-[#7C5CFF] hover:text-gray-900 dark:hover:text-white text-sm font-bold flex items-center gap-2 transition-all group bg-[#7C5CFF]/10 px-4 py-2 rounded-full border border-[#7C5CFF]/20">
              View All Test Series <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 text-gray-900 dark:text-white/20">
              <Loader2 className="w-12 h-12 animate-spin text-[#7C5CFF] mb-4" />
              <p className="font-medium tracking-widest uppercase text-xs">Initializing Test Engine</p>
            </div>
          ) : (
            <div className="relative">
              <SingleExamsCarousel 
                exams={filteredExams} 
                categorySlug={categorySlug || ''} 
                stats={examStats}
                isAdmin={isAdmin}
                onEdit={handleOpenModal}
                onDelete={confirmDelete}
              />
            </div>
          )}
        </div>
      </section>

      {/* Section 1: Features */}
      <section className="py-24 bg-[#1F1F26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Strategic Preparation Tools</h2>
            <div className="h-1.5 w-24 bg-[#7C5CFF] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {[
              { icon: BookOpen, title: "Exam Based Tests", desc: "Topic-wise & full-length mocks", color: "text-blue-400" },
              { icon: BarChart3, title: "Performance Analysis", desc: "Detailed AI-powered insights", color: "text-purple-400" },
              { icon: Target, title: "Smart Preparation", desc: "Focus on weak areas specifically", color: "text-orange-400" },
              { icon: Trophy, title: "Trusted by Toppers", desc: "Selected aspirants' choice", color: "text-yellow-400" }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 sm:p-8 rounded-[32px] bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-[#7C5CFF]/30 transition-all hover:-translate-y-2 group">
                <div className={`w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-[#B8B8C8] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Why Choose MahiMock */}
      <section className="py-24 bg-[#1B1B22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 leading-tight">
                Why Choose <span className="text-[#7C5CFF]">MahiMock</span>?
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Latest Pattern Tests", desc: "Updated weekly with newest exam trends", icon: Zap },
                  { title: "All India Ranking", desc: "See where you stand among competitors", icon: Trophy },
                  { title: "Detailed Solutions", desc: "Step-by-step explanations for every question", icon: BookOpen },
                  { title: "AI Performance Analysis", desc: "Predictive scoring and time management tips", icon: BarChart3 }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="w-12 h-12 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center shrink-0 border border-[#7C5CFF]/20 group-hover:bg-[#7C5CFF] group-hover:text-white transition-all">
                      <item.icon className="w-6 h-6 text-[#7C5CFF] group-hover:text-gray-900 dark:hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{item.title}</h4>
                      <p className="text-[#B8B8C8] text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-[#7C5CFF]/20 rounded-full blur-[100px]"></div>
               <div className="relative rounded-[40px] border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 p-8 sm:p-12 backdrop-blur-xl">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                       <Shield className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Trust & Quality</h3>
                       <p className="text-[#B8B8C8]">100% Secure & Authentic Content</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-gray-100 dark:bg-white/5 text-center">
                       <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">50K+</p>
                       <p className="text-xs text-[#B8B8C8] uppercase font-bold tracking-widest">Aspirants</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-gray-100 dark:bg-white/5 text-center">
                       <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">1M+</p>
                       <p className="text-xs text-[#B8B8C8] uppercase font-bold tracking-widest">Tests Taken</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Preparation Banner */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto rounded-[48px] bg-gradient-to-br from-[#7C5CFF] to-[#4A356C] p-10 sm:p-20 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gray-200 dark:bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 relative z-10">Stay Ahead In Your Preparation</h2>
          <p className="text-xl text-gray-900 dark:text-white/80 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
            Practice daily with real exam level mock tests and improve your All India Ranking.
          </p>
          <button className="px-10 py-5 rounded-2xl bg-white text-[#7C5CFF] font-black text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-2xl relative z-10 flex items-center gap-3 mx-auto">
            Start Practicing Now <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Section 4: Latest Updates */}
      <section className="py-24 bg-[#1B1B22]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Latest Exam Updates</h2>
              <p className="text-[#B8B8C8] mt-2">Real-time notifications for {categoryInfo.name}</p>
            </div>
            <Link to="/updates" className="text-[#7C5CFF] font-bold text-sm hover:underline">View All Updates</Link>
          </div>
          
          <div className="space-y-4">
            {updates.length > 0 ? updates.map((update) => (
              <a 
                key={update.id}
                href={update.link || '#'}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-6 p-6 rounded-3xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:border-[#7C5CFF]/30 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#7C5CFF]/10 flex items-center justify-center shrink-0 border border-[#7C5CFF]/20 group-hover:bg-[#7C5CFF] group-hover:text-white transition-all">
                   <Bell className="w-6 h-6 text-[#7C5CFF] group-hover:text-gray-900 dark:hover:text-white" />
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-3 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#7C5CFF]/20 text-[#7C5CFF] text-[10px] font-bold uppercase tracking-widest">{update.tag || categoryInfo.name}</span>
                      <span className="text-[#B8B8C8] text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {update.date?.toDate ? new Date(update.date.toDate()).toLocaleDateString() : 'Recent'}</span>
                   </div>
                   <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-[#7C5CFF] transition-colors truncate">{update.title}</h4>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-900 dark:text-white/20 group-hover:text-[#7C5CFF] transition-all group-hover:translate-x-1" />
              </a>
            )) : (
              <div className="p-12 text-center bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5">
                 <Bell className="w-12 h-12 text-gray-900 dark:text-white/10 mx-auto mb-4" />
                 <p className="text-[#B8B8C8]">No recent updates for this category yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section 5: FAQ Accordion */}
      <section className="py-24 bg-[#1F1F26]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-[#B8B8C8]">Everything you need to know about our {categoryInfo.name} test series</p>
          </div>
          
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="rounded-3xl border border-gray-200 dark:border-white/5 bg-gray-100 dark:bg-white/5 overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 dark:bg-white/5 transition-colors"
                >
                  <span className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-4">
                    <HelpCircle className="w-5 h-5 text-[#7C5CFF]" />
                    {faq.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 text-gray-900 dark:text-white/30 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${activeFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                   <div className="p-6 pt-0 text-[#B8B8C8] leading-relaxed border-t border-gray-200 dark:border-white/5 ml-9">
                      {faq.a}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[100] flex justify-center p-4 overflow-y-auto pt-10 pb-20">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl animate-in fade-in zoom-in-95 duration-200 h-fit text-gray-900">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[32px] z-10">
              <h3 className="text-2xl font-black text-gray-900">{editingExam ? 'Edit Exam' : 'Add New Exam'}</h3>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 md:col-span-2">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {logoPreview ? (
                        <img loading="lazy" src={logoPreview} alt="Preview" className="w-full h-full object-contain p-3" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 w-full text-center sm:text-left">
                      <label className="block text-sm font-bold text-gray-900 mb-1">Exam Logo</label>
                      <p className="text-xs text-gray-500 mb-4">Upload a high-quality transparent logo</p>
                      <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:border-[#7C5CFF] hover:text-[#7C5CFF] cursor-pointer transition-all shadow-sm">
                        <span>Choose File</span>
                        <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setLogoPreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Exam Full Name</label>
                      <input required type="text" value={formData.examName} onChange={(e) => {
                        const val = e.target.value;
                        setFormData({...formData, examName: val, slug: !editingExam ? val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : formData.slug});
                      }} className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#7C5CFF] outline-none transition-all" placeholder="e.g. SSC CGL 2024" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Short Name (Tag)</label>
                      <input type="text" value={formData.shortName} onChange={(e) => setFormData({...formData, shortName: e.target.value})} className="w-full border border-gray-200 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-[#7C5CFF] outline-none transition-all" placeholder="e.g. CGL" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 flex gap-4 justify-end">
                <button type="button" onClick={handleCloseModal} className="px-8 py-3.5 rounded-2xl text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-10 py-3.5 rounded-2xl bg-[#7C5CFF] text-white font-bold text-sm hover:bg-[#6D4AE0] transition-all shadow-lg shadow-[#7C5CFF]/20 disabled:opacity-50">
                  {saving ? 'Saving...' : editingExam ? 'Update Exam' : 'Create Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {examToDelete && (
        <div className="fixed inset-0 bg-gray-900/60 dark:bg-gray-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 text-gray-900">
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Exam?</h3>
              <p className="text-gray-500 mb-8">This will permanently remove this exam series and all associated data.</p>
              
              <div className="flex gap-4">
                <button onClick={cancelDelete} disabled={deleting} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-900 dark:text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

