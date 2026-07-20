import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, Loader2, ArrowLeft, Search, Plus, Edit2, Trash2, X, 
  ClipboardList, BookOpen, Layers, Clock, FileText, CheckCircle2, Image as ImageIcon,
  ListPlus, Play, ArrowRightCircle, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { ExamLogo } from '../components/ExamLogo';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

// ... will add the rest later ...

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
}

interface Subject {
  id: string;
  examId: string;
  name: string;
  shortName?: string;
  logo?: string;
  isActive?: boolean;
  displayOrder: number;
}

interface Chapter {
  id: string;
  examId: string;
  subjectId: string;
  name: string;
  displayOrder: number;
}

interface Test {
  id: string;
  examId: string;
  type: string;
  subjectId?: string;
  chapterId?: string;
  title: string;
  sectionName?: string;
  description?: string;
  questionsCount: number;
  durationMinutes: number;
  displayOrder: number;
  logo?: string;
  totalMarks?: number;
  negativeMarking?: string;
  showResultImmediately?: boolean;
  
  language?: 'Hindi' | 'English' | 'Bilingual';
  status?: 'Draft' | 'Published';
}

type DashboardView = 'overview' | 'full-mocks' | 'subjects-list' | 'subject-tests' | 'chapters-list' | 'chapter-tests' | 'sectional-subjects' | 'previous-year-papers';

export default function ExamDetail() {
  const { categorySlug, examSlug } = useParams();
  const navigate = useNavigate();
  const { isAdmin, currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  
  const [view, setView] = useState<DashboardView>('overview');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [attempts, setAttempts] = useState<Record<string, any>>({});

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Forms state
  const [subjectForm, setSubjectForm] = useState({ name: '', shortName: '', displayOrder: 0, isActive: true });
  const [subjectLogoPreview, setSubjectLogoPreview] = useState<string>('');
  const [chapterForm, setChapterForm] = useState({ name: '', displayOrder: 0 });
  const [testForm, setTestForm] = useState({ 
    title: '', 
    sectionName: '',
    description: '',
    questionsCount: 100, 
    durationMinutes: 120, 
    displayOrder: 0,
    totalMarks: 100,
    negativeMarking: '0',
    showResultImmediately: true,
    language: 'Hindi' as 'Hindi' | 'English' | 'Bilingual',
    status: 'Draft' as 'Draft' | 'Published'
  });
  const [testLogoPreview, setTestLogoPreview] = useState<string>('');
  
  useEffect(() => {
    if (!categorySlug || !examSlug) return;
    
    setLoading(true);
    let unsubSubjects: () => void;
    let unsubChapters: () => void;
    let unsubTests: () => void;
    let unsubResults: () => void;

    const fetchExam = async () => {
      try {
        const q = query(collection(db, 'exams'), where('slug', '==', examSlug));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setLoading(false);
          return;
        }
        
        const examData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Exam;
        setExam(examData);
        
        // Setup subscriptions
        const subjectsQ = query(collection(db, 'subjects'), where('examId', '==', examData.id));
        unsubSubjects = onSnapshot(subjectsQ, (snap) => {
          const list: Subject[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Subject));
          setSubjects(list.sort((a, b) => a.displayOrder - b.displayOrder));
        });
        
        const chaptersQ = query(collection(db, 'chapters'), where('examId', '==', examData.id));
        unsubChapters = onSnapshot(chaptersQ, (snap) => {
          const list: Chapter[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Chapter));
          setChapters(list.sort((a, b) => a.displayOrder - b.displayOrder));
        });
        
        const testsQ = query(collection(db, 'tests'), where('examId', '==', examData.id));
        unsubTests = onSnapshot(testsQ, (snap) => {
          const list: Test[] = [];
          snap.forEach(d => list.push({ id: d.id, ...d.data() } as Test));
          setTests(list.sort((a, b) => a.displayOrder - b.displayOrder));
        });

        if (currentUser) {
          const resultsQ = query(
            collection(db, 'results'), 
            where('userId', '==', currentUser.uid)
          );
          unsubResults = onSnapshot(resultsQ, (snap) => {
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
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam data", err);
        setLoading(false);
      }
    };
    
    fetchExam();
    
    return () => {
      if (unsubSubjects) unsubSubjects();
      if (unsubChapters) unsubChapters();
      if (unsubTests) unsubTests();
      if (unsubResults) unsubResults();
    };
  }, [categorySlug, examSlug, currentUser]);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#5B5FFB] animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Exam not found</h2>
        <p className="text-gray-500 mb-6">The exam you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="text-[#5B5FFB] font-semibold hover:underline">
          Go back to Home
        </Link>
      </div>
    );
  }

  // --- Subject Handlers ---
  const handleOpenSubjectModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setSubjectForm({ 
        name: subject.name, 
        shortName: subject.shortName || '', 
        displayOrder: subject.displayOrder || 0,
        isActive: subject.isActive !== false
      });
      setSubjectLogoPreview(subject.logo || '');
    } else {
      setEditingSubject(null);
      setSubjectForm({ name: '', shortName: '', displayOrder: subjects.length, isActive: true });
      setSubjectLogoPreview('');
    }
    setIsSubjectModalOpen(true);
  };
  
  const handleSubjectLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error('Image must be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubjectLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || saving) return;
    setSaving(true);
    try {
      const data = { 
        ...subjectForm, 
        examId: exam.id,
        logo: subjectLogoPreview
      };
      // Clean undefined/empty values
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined && v !== '')
      );
      
      if (editingSubject) {
        await updateDoc(doc(db, 'subjects', editingSubject.id), cleanData);
        toast.success('Subject updated');
      } else {
        await addDoc(collection(db, 'subjects'), cleanData);
        toast.success('Subject added');
      }
      setIsSubjectModalOpen(false);
    } catch (err) {
      toast.error('Failed to save subject');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Delete this subject and all its chapters/tests?')) return;
    try {
      await deleteDoc(doc(db, 'subjects', id));
      toast.success('Subject deleted');
    } catch (err) {
      toast.error('Failed to delete subject');
    }
  };

  // --- Chapter Handlers ---
  const handleOpenChapterModal = (chapter?: Chapter) => {
    if (!selectedSubject) return;
    if (chapter) {
      setEditingChapter(chapter);
      setChapterForm({ name: chapter.name, displayOrder: chapter.displayOrder || 0 });
    } else {
      setEditingChapter(null);
      setChapterForm({ name: '', displayOrder: chapters.filter(c => c.subjectId === selectedSubject.id).length });
    }
    setIsChapterModalOpen(true);
  };
  
  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || !selectedSubject || saving) return;
    setSaving(true);
    try {
      const data = { ...chapterForm, examId: exam.id, subjectId: selectedSubject.id };
      if (editingChapter) {
        await updateDoc(doc(db, 'chapters', editingChapter.id), data);
        toast.success('Chapter updated');
      } else {
        await addDoc(collection(db, 'chapters'), data);
        toast.success('Chapter added');
      }
      setIsChapterModalOpen(false);
    } catch (err) {
      toast.error('Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteChapter = async (id: string) => {
    if (!window.confirm('Delete this chapter and all its tests?')) return;
    try {
      await deleteDoc(doc(db, 'chapters', id));
      toast.success('Chapter deleted');
    } catch (err) {
      toast.error('Failed to delete chapter');
    }
  };

  // --- Test Handlers ---
  const handleOpenTestModal = (test?: Test, overrideView?: DashboardView, overrideSubject?: Subject, overrideChapter?: Chapter) => {
    const currentView = overrideView || view;
    const currentSubject = overrideSubject || selectedSubject;
    const currentChapter = overrideChapter || selectedChapter;

    if (test) {
      setEditingTest(test);
      setTestForm({ 
        title: test.title, 
        sectionName: test.sectionName || '',
        description: test.description || '',
        questionsCount: test.questionsCount, 
        durationMinutes: test.durationMinutes, 
        displayOrder: test.displayOrder || 0,
        totalMarks: test.totalMarks || 100,
        negativeMarking: test.negativeMarking || '0',
        showResultImmediately: test.showResultImmediately ?? true,
        language: test.language || 'Hindi',
        status: test.status || 'Draft'
      });
      setTestLogoPreview(test.logo || '');
    } else {
      setEditingTest(null);
      let currentTests = tests;
      if (currentView === 'full-mocks') currentTests = tests.filter(t => t.type === 'Full Mock Tests');
      else if (currentView === 'sectional-subjects') currentTests = tests.filter(t => t.type === 'Sectional Tests' && t.subjectId === currentSubject?.id);
      else if (currentView === 'chapter-tests') currentTests = tests.filter(t => t.type === 'Topic Tests' && t.chapterId === currentChapter?.id);
      
      setTestForm({ 
        title: '', 
        sectionName: '',
        description: '',
        questionsCount: 100, 
        durationMinutes: 120, 
        displayOrder: currentTests.length,
        totalMarks: 100,
        negativeMarking: '0',
        showResultImmediately: true,
        language: 'Hindi',
        status: 'Draft'
      });
      setTestLogoPreview('');
    }
    setIsTestModalOpen(true);
  };
  
  const handleTestLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        toast.error('Image must be less than 500KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTestLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exam || saving) return;
    setSaving(true);
    try {
      let type: string = editingTest?.type || 'Full Mock Tests';
      let subjectId = editingTest?.subjectId || '';
      let chapterId = editingTest?.chapterId || '';
      
      if (!editingTest) {
        // Find current active subject in case selectedSubject is empty but we are in subject view
        const visibleSubjects = subjects.filter(s => isAdmin || s.isActive !== false);
        const currentSubject = selectedSubject || visibleSubjects[0];

        if (view === 'sectional-subjects' && currentSubject) {
          type = 'Sectional Tests';
          subjectId = currentSubject.id;
        } else if (view === 'chapter-tests' && selectedChapter) {
          type = 'Topic Tests';
          chapterId = selectedChapter.id;
          subjectId = selectedChapter.subjectId;
        } else if (view === 'previous-year-papers') {
          type = 'Previous Year Papers';
        }
      }
      
      const data: Partial<Test> = { 
        ...testForm, 
        examId: exam.id, 
        type 
      };
      if (subjectId) data.subjectId = subjectId;
      if (chapterId) data.chapterId = chapterId;
      if (testLogoPreview) data.logo = testLogoPreview;
      
      if (editingTest) {
        await updateDoc(doc(db, 'tests', editingTest.id), data);
        toast.success('Test updated');
      } else {
        await addDoc(collection(db, 'tests'), data);
        toast.success('Test added');
      }
      setIsTestModalOpen(false);
    } catch (err) {
      toast.error('Failed to save test');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteTest = async (id: string) => {
    if (!window.confirm('Delete this test?')) return;
    try {
      await deleteDoc(doc(db, 'tests', id));
      toast.success('Test deleted');
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  // Compute filtered lists
  const filteredMocks = tests.filter(t => t.type === 'Full Mock Tests' && t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (isAdmin || t.status === 'Published'));
  
  const currentSubjectChapters = selectedSubject 
    ? chapters.filter(c => c.subjectId === selectedSubject.id && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
    
  const currentSubjectTests = selectedSubject
    ? tests.filter(t => t.type === 'Sectional Tests' && t.subjectId === selectedSubject.id && t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (isAdmin || t.status === 'Published'))
    : [];
    
  const currentChapterTests = selectedChapter
    ? tests.filter(t => t.type === 'Topic Tests' && t.chapterId === selectedChapter.id && t.title.toLowerCase().includes(searchQuery.toLowerCase()) && (isAdmin || t.status === 'Published'))
    : [];

  const renderDashboard = () => {
    const dashboardCards = [
      {
        id: 'full-mocks',
        title: 'Full Mock Tests',
        description: 'Complete length practice tests covering all sections of the exam.',
        count: `${tests.filter(t => t.type === 'Full Mock Tests' && (isAdmin || t.status === 'Published')).length} Mock Tests`,
        icon: <ClipboardList className="w-8 h-8" />,
        color: 'from-blue-600 to-indigo-600',
        glow: 'bg-indigo-500',
        onClick: () => setView('full-mocks')
      },
      {
        id: 'previous-year',
        title: 'Previous Year Papers',
        description: 'Real exam papers from previous years to understand the actual pattern.',
        count: `${tests.filter(t => t.type === 'Previous Year Papers' && (isAdmin || t.status === 'Published')).length} Papers`,
        icon: <FileText className="w-8 h-8" />,
        color: 'from-emerald-600 to-teal-600',
        glow: 'bg-emerald-500',
        onClick: () => setView('previous-year-papers')
      },
      {
        id: 'subject-tests',
        title: 'Topic Tests',
        description: 'In-depth topic-wise tests to master every single concept.',
        count: `${chapters.length} Topics`,
        icon: <BookOpen className="w-8 h-8" />,
        color: 'from-purple-600 to-fuchsia-600',
        glow: 'bg-fuchsia-500',
        onClick: () => setView('subjects-list')
      },
      {
        id: 'section-tests',
        title: 'Section Tests',
        description: 'Targeted sectional tests to improve your speed and accuracy.',
        count: `${subjects.length} Sections`,
        icon: <Zap className="w-8 h-8" />,
        color: 'from-amber-500 to-orange-600',
        glow: 'bg-amber-500',
        onClick: () => setView('sectional-subjects')
      }
    ];

    return (
      <div className="relative">
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:snap-none"
        >
          {dashboardCards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={card.onClick}
              className="flex-shrink-0 w-[180px] h-[200px] sm:w-[200px] sm:h-[220px] md:w-auto md:h-auto snap-center cursor-pointer group"
            >
              <div className="h-full bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md border border-gray-200 dark:border-white/5 hover:border-gray-200 dark:border-white/10 rounded-[24px] p-5 sm:p-6 shadow-lg shadow-black/20 relative overflow-hidden flex flex-col justify-between transition-all duration-300">
                {/* Background Glow */}
                <div className={`absolute -top-16 -right-16 w-32 h-32 ${card.glow} opacity-10 blur-[50px] group-hover:opacity-20 transition-opacity`} />
                
                <div>
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] sm:rounded-[16px] bg-gradient-to-br ${card.color} text-white flex items-center justify-center mb-4 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="scale-90 sm:scale-100">{card.icon}</div>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-2 group-hover:text-indigo-400 transition-colors leading-tight">{card.title}</h3>
                  <p className="text-gray-900 dark:text-white/40 text-[10px] sm:text-xs leading-snug sm:leading-relaxed line-clamp-2">{card.description}</p>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                  <span className="text-[9px] sm:text-[11px] font-black text-gray-900 dark:text-white/60 uppercase tracking-widest truncate mr-2">{card.count}</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/40 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all duration-300">
                    <ArrowRightCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderEmptyState = (message: string, actionBtn?: React.ReactNode) => (
    <div className="bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-2xl p-12 shadow-sm text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-white/10">
        <Search className="w-8 h-8 text-gray-900 dark:text-white/20" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No data found</h3>
      <p className="text-gray-900 dark:text-white/40 max-w-sm mx-auto mb-6">{message}</p>
      {actionBtn}
    </div>
  );

  const renderSubjectList = (nextView: DashboardView) => {
    const visibleSubjects = subjects.filter(s => isAdmin || s.isActive !== false);
    const activeSubject = selectedSubject || visibleSubjects[0];

    const activeSubjectChapters = chapters.filter(c => c.subjectId === activeSubject?.id);
    const activeSubjectTests = tests.filter(t => t.type === 'Sectional Tests' && t.subjectId === activeSubject?.id && (isAdmin || t.status === 'Published'));

    return (
      <div className="bg-[#F8FAFC] dark:bg-[#0B0F1A] rounded-[32px] p-4 sm:p-8 shadow-2xl relative overflow-hidden border border-gray-200 dark:border-white/5">
        {/* Premium Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('overview')} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all text-gray-900 dark:text-white/70 hover:text-gray-900 dark:hover:text-white shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{nextView === 'subject-tests' ? 'Section Tests' : 'Topic Tests'}</h2>
              <p className="text-gray-900 dark:text-white/40 text-sm font-medium hidden sm:block">Select a subject to view available {nextView === 'subject-tests' ? 'tests' : 'topics'}.</p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleOpenSubjectModal()} 
                className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white/70 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:bg-white/10 transition-all text-sm font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" /> Section
              </button>
              {nextView === 'chapters-list' && activeSubject && (
                <button 
                  onClick={() => {
                    if (!selectedSubject) setSelectedSubject(activeSubject);
                    setTimeout(() => handleOpenChapterModal(), 0);
                  }} 
                  className="flex items-center gap-2 bg-indigo-600 text-gray-900 dark:text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all text-sm font-bold"
                >
                  <Plus className="w-4 h-4" /> Topic
                </button>
              )}
              {nextView === 'subject-tests' && activeSubject && (
                <button 
                  onClick={() => {
                    if (!selectedSubject) setSelectedSubject(activeSubject);
                    // For test modal we need to set view context appropriately before opening
                    setTimeout(() => handleOpenTestModal(undefined, 'sectional-subjects', activeSubject), 0);
                  }} 
                  className="flex items-center gap-2 bg-indigo-600 text-gray-900 dark:text-white px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all text-sm font-bold"
                >
                  <Plus className="w-4 h-4" /> Test
                </button>
              )}
            </div>
          )}
        </div>
        
        {visibleSubjects.length === 0 ? (
          <div className="text-center py-16 relative z-10">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-white/10">
              <Search className="w-8 h-8 text-gray-900 dark:text-white/20" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No subjects found</h3>
            <p className="text-gray-900 dark:text-white/40 text-sm">Subjects will appear here once added.</p>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Horizontal Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
              {visibleSubjects.map((subject) => {
                const isActive = activeSubject?.id === subject.id;
                return (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className={`flex-shrink-0 snap-start px-5 py-2.5 rounded-[16px] font-bold text-sm transition-all duration-300 border flex items-center gap-2 ${
                      isActive 
                        ? 'bg-indigo-600 text-gray-900 dark:text-white border-indigo-500 shadow-lg shadow-indigo-500/25' 
                        : 'bg-white/[0.03] text-gray-900 dark:text-white/50 border-gray-200 dark:border-white/5 hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-200 dark:border-white/10'
                    }`}
                  >
                    {subject.logo && (
                       <img loading="lazy" src={subject.logo} alt={subject.name} className="w-5 h-5 object-contain" />
                    )}
                    {subject.name}
                  </button>
                );
              })}
            </div>

            {/* Content List */}
            {nextView === 'chapters-list' && (
              <div className="space-y-3">
                {activeSubjectChapters.length === 0 ? (
                   <div className="text-center py-12 bg-white/[0.02] rounded-[20px] border border-gray-200 dark:border-white/5">
                     <p className="text-gray-900 dark:text-white/40 font-medium">No Topics Available</p>
                   </div>
                ) : (
                  activeSubjectChapters.map((chapter, idx) => {
                    const chapterTests = tests.filter(t => t.chapterId === chapter.id && t.type === 'Topic Tests' && (isAdmin || t.status === 'Published'));
                    
                    return (
                      <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          setSelectedChapter(chapter);
                          setView('chapter-tests');
                        }}
                        className="bg-white/[0.03] hover:bg-white/[0.06] border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 p-4 sm:p-5 rounded-[16px] cursor-pointer transition-all duration-300 group flex items-center justify-between shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base mb-1 group-hover:text-indigo-400 transition-colors">{chapter.name}</h3>
                            <p className="text-gray-900 dark:text-white/40 text-xs font-semibold tracking-wide">{chapterTests.length} Tests Available</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isAdmin && (
                            <div className="flex gap-2 mr-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); handleOpenChapterModal(chapter); }} className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chapter.id); }} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white/30 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all shadow-sm">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {nextView === 'subject-tests' && (
              <div className="space-y-3">
                {activeSubjectTests.length === 0 ? (
                   <div className="text-center py-12 bg-white/[0.02] rounded-[20px] border border-gray-200 dark:border-white/5">
                     <p className="text-gray-900 dark:text-white/40 font-medium">No Tests Available</p>
                   </div>
                ) : (
                  activeSubjectTests.map((test, idx) => {
                    const attempt = attempts[test.id];
                    return (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => {
                          if (isAdmin) {
                            navigate(`/admin/tests/${test.id}/questions`);
                          } else {
                            navigate('/test-instructions/' + test.id);
                          }
                        }}
                        className="bg-white/[0.03] hover:bg-white/[0.06] border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 p-4 sm:p-5 rounded-[16px] cursor-pointer transition-all duration-300 group flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-110 transition-all">
                            {test.logo ? (
                              <img loading="lazy" src={test.logo} alt={test.title} className="w-full h-full object-contain p-2" />
                            ) : (
                              <FileText className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <h3 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base group-hover:text-indigo-400 transition-colors leading-tight">{test.title}</h3>
                              {test.status === 'Draft' && <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 uppercase tracking-widest border border-amber-500/20">Draft</span>}
                              {attempt && (
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1 text-emerald-400">
                                  <CheckCircle2 className="w-3 h-3" /> Attempted
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-900 dark:text-white/40 font-semibold tracking-wide">
                              <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5 text-indigo-400/70" /> {test.questionsCount} Qs</span>
                              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-indigo-400/70" /> {test.durationMinutes}m</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          {!isAdmin && test.status !== 'Draft' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); navigate('/test-instructions/' + test.id); }}
                              className={`flex-1 sm:flex-none px-6 py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm ${
                                attempt 
                                ? 'bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-gray-900 dark:text-white shadow-indigo-500/20'
                              }`}
                            >
                              {attempt ? 'Reattempt' : 'Start'}
                            </button>
                          )}
                          {isAdmin ? (
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button 
                                onClick={(e) => { e.stopPropagation(); navigate(`/admin/tests/${test.id}/questions`); }}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-gray-900 dark:text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                              >
                                <ListPlus className="w-4 h-4" /> Qs
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleOpenTestModal(test); }} className="w-10 h-10 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteTest(test.id); }} className="w-10 h-10 flex items-center justify-center bg-red-500/10 text-red-400 rounded-xl hover:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white/30 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all shadow-sm">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderTestList = (testList: Test[], title: string, onBack: () => void) => (
    <div className="space-y-8 bg-[#F8FAFC] dark:bg-[#0B0F1A] p-4 sm:p-8 rounded-[32px] border border-gray-200 dark:border-white/5 relative overflow-hidden">
      {/* Premium Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 rounded-xl border border-gray-200 dark:border-white/10 transition-all text-gray-900 dark:text-white/70 hover:text-gray-900 dark:hover:text-white shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h2>
            <p className="text-gray-900 dark:text-white/40 text-sm font-medium hidden sm:block">Attempt these tests to boost your preparation.</p>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => handleOpenTestModal(undefined, view, selectedSubject, selectedChapter)} 
            className="flex items-center justify-center gap-2 bg-indigo-600 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all text-sm font-bold"
          >
            <Plus className="w-4 h-4" /> {view === 'full-mocks' ? 'Add Mock' : 'Add Test'}
          </button>
        )}
      </div>
      
      {testList.length === 0 ? (
        <div className="relative z-10">
          {renderEmptyState('No tests found in this section.')}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 relative z-10">
          {testList.map((test, idx) => {
            const attempt = attempts[test.id];
            const percentage = attempt ? (attempt.score / (test.totalMarks || 100)) * 100 : 0;

            return (
              <motion.div 
                key={test.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => {
                  if (isAdmin) {
                    navigate(`/admin/tests/${test.id}/questions`);
                  } else {
                    navigate('/test-instructions/' + test.id);
                  }
                }}
                className="bg-white/[0.03] hover:bg-white/[0.06] border border-gray-200 dark:border-white/5 hover:border-indigo-500/30 p-5 rounded-[20px] cursor-pointer transition-all duration-300 group flex flex-col lg:flex-row lg:items-center justify-between relative gap-6 shadow-sm"
              >
                <div className="flex items-start sm:items-center gap-5 flex-1">
                  <div className="w-14 h-14 rounded-[16px] bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    {test.logo ? (
                      <img loading="lazy" src={test.logo} alt={test.title} className="w-full h-full object-contain p-3" />
                    ) : (
                      <FileText className="w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-indigo-400 transition-colors truncate">
                        {test.title}
                      </h3>
                      {test.status === 'Draft' && <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 uppercase tracking-widest border border-amber-500/20">Draft</span>}
                      {attempt && (
                        <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3" /> Attempted
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-900 dark:text-white/40 font-bold">
                      <span className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5 text-indigo-400/70" /> {test.questionsCount} Questions</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-indigo-400/70" /> {test.durationMinutes} Mins</span>
                      {test.totalMarks && <span className="flex items-center gap-1.5 text-indigo-400/50">{test.totalMarks} Marks</span>}
                    </div>

                    {attempt && (
                      <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-900 dark:text-white/30 uppercase tracking-widest mb-1">Last Score</span>
                          <span className="text-sm font-black text-gray-900 dark:text-white">{attempt.score.toFixed(1)}<span className="text-gray-900 dark:text-white/30 font-bold ml-1">/ {test.totalMarks || 100}</span></span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-900 dark:text-white/30 uppercase tracking-widest mb-1">Accuracy</span>
                          <span className={`text-sm font-black ${percentage >= 70 ? 'text-emerald-400' : percentage >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-gray-900 dark:text-white/30 uppercase tracking-widest mb-1">Last Attempt</span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white/60">{attempt.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
                  {!isAdmin && test.status !== 'Draft' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate('/test-instructions/' + test.id); }}
                      className={`px-8 py-3 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg flex-1 lg:flex-none ${
                        attempt 
                        ? 'bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:bg-white/10' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-gray-900 dark:text-white shadow-indigo-500/20'
                      }`}
                    >
                      {attempt ? 'Reattempt' : 'Start Now'}
                    </button>
                  )}
                  {isAdmin ? (
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/tests/${test.id}/questions`); }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 text-gray-900 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                      >
                        <ListPlus className="w-4 h-4" /> Questions
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/test-instructions/${test.id}`); }}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white/70 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-200 dark:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-200 dark:border-white/10"
                      >
                        <Play className="w-4 h-4" /> Preview
                      </button>
                    </div>
                  ) : (
                    <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white/30 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all duration-300 shadow-sm border border-gray-200 dark:border-white/5">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={(e) => { e.stopPropagation(); handleOpenTestModal(test); }} className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTest(test.id); }} className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0B0F1A] min-h-screen pb-20">
      {/* Redesigned Premium Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FAFC] dark:from-[#0B0F1A] via-gray-50 dark:via-[#1A1D29] to-[#F8FAFC] dark:to-[#0B0F1A]"></div>
        {/* Animated Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
          {/* Breadcrumbs */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center text-[10px] sm:text-xs mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar"
          >
            <Link to="/" className="text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors font-bold uppercase tracking-widest">Home</Link>
            <ChevronRight className="w-3 h-3 mx-2 text-gray-900 dark:text-white/20 flex-shrink-0" />
            <Link to={`/exams/${categorySlug}`} className="text-gray-900 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors font-bold uppercase tracking-widest">{categorySlug}</Link>
            <ChevronRight className="w-3 h-3 mx-2 text-gray-900 dark:text-white/20 flex-shrink-0" />
            <span className="text-indigo-400 font-black uppercase tracking-widest truncate">{exam.examName}</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-24 h-24 md:w-32 md:h-32 rounded-[28px] bg-gray-200 dark:bg-white/10 backdrop-blur-xl border border-gray-300 dark:border-white/20 flex flex-shrink-0 items-center justify-center p-5 shadow-2xl overflow-hidden group hover:scale-105 transition-transform duration-500"
            >
              <ExamLogo logo={exam.logoUrl || exam.logo} name={exam.examName} />
            </motion.div>
            
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <Zap className="w-3 h-3" /> Targeted Preparation
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4 leading-tight">
                  {exam.examName} <span className="text-indigo-500">Dashboard</span>
                </h1>
                <p className="text-gray-900 dark:text-white/50 text-sm sm:text-base font-medium line-clamp-2 max-w-3xl leading-relaxed">
                  {exam.description || `Prepare for ${exam.examName} with comprehensive mock tests and sectional practice.`}
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full lg:w-auto mt-6 lg:mt-0 relative"
            >
              <Search className="w-5 h-5 text-gray-900 dark:text-white/20 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search tests, topics..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full lg:w-80 pl-12 pr-4 py-4 bg-gray-100 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/20 text-sm font-medium transition-all shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'overview' && renderDashboard()}
            {view === 'full-mocks' && renderTestList(filteredMocks, 'Full Mock Tests', () => setView('overview'))}
            {view === 'previous-year-papers' && renderTestList(tests.filter(t => t.type === 'Previous Year Papers' && (isAdmin || t.status === 'Published')), 'Previous Year Papers', () => setView('overview'))}
            {view === 'subjects-list' && renderSubjectList('chapters-list')}
            {view === 'sectional-subjects' && renderSubjectList('subject-tests')}
            {view === 'chapter-tests' && renderTestList(currentChapterTests, `${selectedChapter?.name} Tests`, () => setView('subjects-list'))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Subject Modal */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#0B0F1A]/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-50 dark:bg-[#1A1D29] border border-gray-200 dark:border-white/10 rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingSubject ? 'Edit Section' : 'Add Section'}</h3>
              <button onClick={() => setIsSubjectModalOpen(false)} className="p-2 text-gray-900 dark:text-white/40 hover:bg-gray-100 dark:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Section Name *</label>
                <input required type="text" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Short Name</label>
                <input type="text" value={subjectForm.shortName} onChange={e => setSubjectForm({...subjectForm, shortName: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/20" placeholder="e.g. Maths" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-2">Section Icon / Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {subjectLogoPreview ? (
                      <img loading="lazy" src={subjectLogoPreview} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-900 dark:text-white/20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white/70 text-sm font-semibold rounded-xl transition-colors border border-gray-200 dark:border-white/10">
                      Upload Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleSubjectLogoChange}
                        className="hidden" 
                      />
                    </label>
                    <p className="text-xs text-gray-900 dark:text-white/30 mt-1">PNG, JPG up to 500KB</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Display Order</label>
                  <input type="number" value={subjectForm.displayOrder} onChange={e => setSubjectForm({...subjectForm, displayOrder: parseInt(e.target.value)||0})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Status</label>
                  <select value={subjectForm.isActive ? 'active' : 'inactive'} onChange={e => setSubjectForm({...subjectForm, isActive: e.target.value === 'active'})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white [&>option]:bg-gray-50 dark:bg-[#1A1D29]">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white/70 font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-gray-900 dark:text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chapter Modal */}
      {isChapterModalOpen && (
        <div className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#0B0F1A]/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-50 dark:bg-[#1A1D29] border border-gray-200 dark:border-white/10 rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingChapter ? 'Edit Topic' : 'Add Topic'}</h3>
              <button onClick={() => setIsChapterModalOpen(false)} className="p-2 text-gray-900 dark:text-white/40 hover:bg-gray-100 dark:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveChapter} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Topic Name *</label>
                <input required type="text" value={chapterForm.name} onChange={e => setChapterForm({...chapterForm, name: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Display Order</label>
                <input type="number" value={chapterForm.displayOrder} onChange={e => setChapterForm({...chapterForm, displayOrder: parseInt(e.target.value)||0})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
              </div>
              <div className="mt-6 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsChapterModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white/70 font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-gray-900 dark:text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Test Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-[#F8FAFC] dark:bg-[#0B0F1A]/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-50 dark:bg-[#1A1D29] border border-gray-200 dark:border-white/10 rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingTest ? 'Edit Test' : 'Add Test'}</h3>
              <button onClick={() => setIsTestModalOpen(false)} className="p-2 text-gray-900 dark:text-white/40 hover:bg-gray-100 dark:bg-white/5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveTest} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Test Title *</label>
                <input required type="text" value={testForm.title} onChange={e => setTestForm({...testForm, title: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Section Name</label>
                  <input type="text" value={testForm.sectionName} onChange={e => setTestForm({...testForm, sectionName: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/20" placeholder="e.g. Reasoning" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Show Result Immediately</label>
                  <select value={testForm.showResultImmediately ? 'true' : 'false'} onChange={e => setTestForm({...testForm, showResultImmediately: e.target.value === 'true'})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white [&>option]:bg-gray-50 dark:bg-[#1A1D29]">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Language</label>
                  <select value={testForm.language} onChange={e => setTestForm({...testForm, language: e.target.value as any})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white [&>option]:bg-gray-50 dark:bg-[#1A1D29]">
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Bilingual">Bilingual (Hindi + English)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Description</label>
                <textarea rows={2} value={testForm.description} onChange={e => setTestForm({...testForm, description: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/20" placeholder="Enter test description..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-2">Test Logo</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {testLogoPreview ? (
                      <img loading="lazy" src={testLogoPreview} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-900 dark:text-white/20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white/70 text-sm font-semibold rounded-xl transition-colors border border-gray-200 dark:border-white/10">
                      Upload Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleTestLogoChange}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Questions</label>
                  <input required type="number" value={testForm.questionsCount} onChange={e => setTestForm({...testForm, questionsCount: parseInt(e.target.value)||0})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Duration (Mins)</label>
                  <input required type="number" value={testForm.durationMinutes} onChange={e => setTestForm({...testForm, durationMinutes: parseInt(e.target.value)||0})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Total Marks</label>
                  <input required type="number" value={testForm.totalMarks} onChange={e => setTestForm({...testForm, totalMarks: parseInt(e.target.value)||0})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Negative Marking</label>
                  <input required type="text" value={testForm.negativeMarking} onChange={e => setTestForm({...testForm, negativeMarking: e.target.value})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Display Order</label>
                  <input type="number" value={testForm.displayOrder} onChange={e => setTestForm({...testForm, displayOrder: parseInt(e.target.value)||0})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white/70 mb-1">Status</label>
                <select value={testForm.status} onChange={e => setTestForm({...testForm, status: e.target.value as any})} className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 dark:text-white [&>option]:bg-gray-50 dark:bg-[#1A1D29]">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </div>
              <div className="mt-6 flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-white/5">
                <button type="button" onClick={() => setIsTestModalOpen(false)} className="px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white/70 font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-gray-900 dark:text-white font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
