import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, onSnapshot, addDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, BookOpen, Loader2, ChevronRight, Search, Plus, X, UploadCloud, Image as ImageIcon, Settings, 
  FileQuestion, CheckCircle2, LayoutGrid, ListPlus, Filter
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '../lib/cloudinary';

export default function SubjectSeriesListing() {
  const [series, setSeries] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Admin Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [subjectFormData, setSubjectFormData] = useState({
    name: '',
    iconName: 'BookOpen',
    logoUrl: '',
    description: '',
    themeColor: 'blue',
    isActive: true,
    order: 0
  });
  const [topicFormData, setTopicFormData] = useState({
    name: '',
    subjectSeriesId: '',
    isActive: true,
    order: 0,
    description: '',
    logoUrl: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'subjectSeries'), where('isActive', '==', true));
    const unsubscribe = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSeries(fetched);
      if (fetched.length > 0 && !selectedSubject) {
        setSelectedSubject(fetched[0]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      setTopicsLoading(true);
      const q = query(
        collection(db, 'subjectTopics'), 
        where('subjectSeriesId', '==', selectedSubject.id),
        where('isActive', '==', true)
      );
      const unsubscribe = onSnapshot(q, async (snap) => {
        const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        fetched.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Fetch test counts for each topic
        const topicsWithCounts = await Promise.all(fetched.map(async (topic) => {
          const testsQ = query(collection(db, 'tests'), where('subjectTopicId', '==', topic.id));
          const testsSnap = await getDocs(testsQ);
          return { ...topic, testCount: testsSnap.size };
        }));
        
        setTopics(topicsWithCounts);
        setTopicsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [selectedSubject]);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'subjectSeries'), {
        ...subjectFormData,
        order: series.length
      });
      toast.success('Subject added successfully');
      setIsSubjectModalOpen(false);
    } catch (err) {
      toast.error('Failed to add subject');
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicFormData.subjectSeriesId) {
      toast.error('Please select a subject');
      return;
    }
    try {
      await addDoc(collection(db, 'subjectTopics'), {
        ...topicFormData,
        order: topics.length
      });
      toast.success('Topic added successfully');
      setIsTopicModalOpen(false);
    } catch (err) {
      toast.error('Failed to add topic');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setSubjectFormData(prev => ({ ...prev, logoUrl: url }));
      toast.success('Logo uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleTopicLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await uploadImageToCloudinary(file);
      setTopicFormData(prev => ({ ...prev, logoUrl: url }));
      toast.success('Topic icon uploaded');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploadingLogo(false);
    }
  };

  const filteredSeries = series.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B1020]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1020] text-gray-900 dark:text-white pb-20 font-hindi">
      {/* Header & Search */}
      <div className="sticky top-0 z-40 bg-white dark:bg-[#0B1020]/90 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5 pt-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/')}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-black tracking-tight">Subject Tests</h1>
            </div>
            
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsSubjectModalOpen(true)}
                  className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 hover:bg-blue-500/20 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setTopicFormData(prev => ({ ...prev, subjectSeriesId: selectedSubject?.id || '' }));
                    setIsTopicModalOpen(true);
                  }}
                  className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-all"
                >
                  <ListPlus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500" />
            <input 
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-600"
            />
          </div>

          {/* Subject Tabs */}
          <div 
            ref={tabsRef}
            className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x"
          >
            {filteredSeries.map((s) => (
              <button
                key={s.id}
                onClick={() => { setSelectedSubject(s); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`flex-none px-6 py-2.5 rounded-full text-xs font-bold transition-all snap-start border ${
                  selectedSubject?.id === s.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' 
                    : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white border-gray-200 dark:border-white/5'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Selected Subject Intro */}
        {selectedSubject && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
             <div className="flex items-center gap-5 mb-5">
                <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-3 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl">
                   {selectedSubject.logoUrl ? (
                     <img loading="lazy" src={selectedSubject.logoUrl} alt="" className="w-full h-full object-contain" />
                   ) : (
                     <BookOpen className="w-8 h-8 text-blue-400" />
                   )}
                </div>
                <div>
                   <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">{selectedSubject.name}</h2>
                   <div className="flex items-center gap-2 mt-1">
                     <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                     <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{topics.length} Modules Available</p>
                   </div>
                </div>
             </div>
             {selectedSubject.description && (
               <p className="text-sm text-gray-400 leading-relaxed max-w-2xl bg-gray-100 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/5">
                 {selectedSubject.description}
               </p>
             )}
          </motion.div>
        )}

        {/* Topics Grid */}
        {topicsLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-10 h-10 text-blue-500/50" />
            </motion.div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-600">Syncing Modules...</p>
          </div>
        ) : topics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {topics.map((topic, idx) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/subject-series/${selectedSubject?.id}?topic=${topic.id}`)}
                className="group bg-white/[0.03] backdrop-blur-sm p-6 rounded-[1.25rem] border border-gray-200 dark:border-white/10 hover:border-blue-500/40 transition-all cursor-pointer relative overflow-hidden shadow-xl"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-600/20 transition-all duration-500" />
                
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-300 overflow-hidden shadow-lg">
                    {topic.logoUrl ? (
                      <img loading="lazy" src={topic.logoUrl} alt="" className="w-full h-full object-contain p-2.5" />
                    ) : (
                      <BookOpen className="w-7 h-7 text-blue-400/80" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-3 line-clamp-2 group-hover:text-blue-400 transition-colors">
                    {topic.name}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-200 dark:border-white/5">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500/40" />
                       <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                         {topic.testCount || 0} Tests
                       </span>
                     </div>
                     <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-gray-900 dark:hover:text-white transition-all shadow-lg">
                        <ChevronRight className="w-5 h-5" />
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 text-center bg-white/[0.02] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10"
          >
             <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-700">
                <FileQuestion className="w-10 h-10" />
             </div>
             <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Modules Found</h3>
             <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
               We are currently preparing topic-wise modules. Please check back later.
             </p>
          </motion.div>
        )}
      </div>

      {/* Admin Modals */}
      <AnimatePresence>
        {isSubjectModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-50 dark:bg-[#1A1D29] rounded-[2.5rem] w-full max-w-md overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl"
            >
              <div className="p-8 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Add Subject</h3>
                <button onClick={() => setIsSubjectModalOpen(false)} className="p-2.5 hover:bg-gray-100 dark:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddSubject} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2.5 ml-1">Subject Name</label>
                  <input 
                    required type="text"
                    value={subjectFormData.name}
                    onChange={e => setSubjectFormData({...subjectFormData, name: e.target.value})}
                    className="w-full bg-white dark:bg-[#0B1020] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                    placeholder="e.g. Quantitative Aptitude"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2.5 ml-1">Description</label>
                  <textarea 
                    value={subjectFormData.description}
                    onChange={e => setSubjectFormData({...subjectFormData, description: e.target.value})}
                    className="w-full bg-white dark:bg-[#0B1020] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500/50 transition-all h-28 resize-none placeholder:text-gray-700"
                    placeholder="Short summary of the subject..."
                  />
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#0B1020] border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {subjectFormData.logoUrl ? (
                      <img loading="lazy" src={subjectFormData.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-700" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-4 text-xs font-bold text-center transition-all flex items-center justify-center gap-3">
                      {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                      {uploadingLogo ? 'Processing...' : 'Upload Brand Icon'}
                    </div>
                    <input type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                  </label>
                </div>
                <button 
                  type="submit" disabled={uploadingLogo}
                  className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-600/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
                >
                  Create Subject
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isTopicModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-gray-50 dark:bg-[#1A1D29] rounded-[2.5rem] w-full max-w-md overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl"
            >
              <div className="p-8 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Add Topic</h3>
                <button onClick={() => setIsTopicModalOpen(false)} className="p-2.5 hover:bg-gray-100 dark:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddTopic} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2.5 ml-1">Parent Subject</label>
                  <div className="relative">
                    <select 
                      required
                      value={topicFormData.subjectSeriesId}
                      onChange={e => setTopicFormData({...topicFormData, subjectSeriesId: e.target.value})}
                      className="w-full bg-white dark:bg-[#0B1020] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500/50 transition-all appearance-none"
                    >
                      <option value="">Select a subject</option>
                      {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 rotate-90" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2.5 ml-1">Topic Name</label>
                  <input 
                    required type="text"
                    value={topicFormData.name}
                    onChange={e => setTopicFormData({...topicFormData, name: e.target.value})}
                    className="w-full bg-white dark:bg-[#0B1020] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                    placeholder="e.g. Percentage & Ratios"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 mb-2.5 ml-1">Description</label>
                  <textarea 
                    value={topicFormData.description}
                    onChange={e => setTopicFormData({...topicFormData, description: e.target.value})}
                    className="w-full bg-white dark:bg-[#0B1020] border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500/50 transition-all h-28 resize-none placeholder:text-gray-700"
                    placeholder="Concept coverage details..."
                  />
                </div>
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-[#0B1020] border-2 border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {topicFormData.logoUrl ? (
                      <img loading="lazy" src={topicFormData.logoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-700" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer">
                    <div className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-4 text-xs font-bold text-center transition-all flex items-center justify-center gap-3">
                      {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                      {uploadingLogo ? 'Processing...' : 'Upload Topic Icon'}
                    </div>
                    <input type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleTopicLogoUpload} disabled={uploadingLogo} />
                  </label>
                </div>
                <button 
                  type="submit" disabled={uploadingLogo}
                  className="w-full py-4.5 bg-purple-600 hover:bg-purple-700 text-gray-900 dark:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-purple-600/20 active:scale-95 transition-all mt-4 disabled:opacity-50"
                >
                  Create Topic Module
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-hindi { font-family: 'Noto Sans Devanagari', 'Inter', sans-serif; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
