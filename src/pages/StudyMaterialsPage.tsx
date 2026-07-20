import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Bookmark, 
  Eye, 
  Calendar, 
  BookOpen, 
  ChevronRight,
  Loader2,
  Clock,
  Layout,
  Book,
  PenTool,
  BookmarkCheck
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';
import BookmarkButton from '../components/BookmarkButton';
import SEO from '../components/SEO';

export default function StudyMaterialsPage() {
  const { currentUser } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'Current Affairs', 'PDF Notes', 'Handwritten Notes', 'Previous Year Papers', 'NCERT Notes', 'E-books'];

  useEffect(() => {
    const q = query(collection(db, 'studyMaterials'), where('status', '==', 'Published'));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMaterials(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.title?.toLowerCase().includes(searchTerm.toLowerCase()) || m.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;

  return (
    <>
      <SEO 
        title="Study Materials & Notes | MahiMock" 
        description="Download premium study materials, handwritten notes, previous year papers, and NCERT notes for all major competitive exams in India."
        path="/study-materials"
        keywords="study materials, pdf notes, handwritten notes, pyqs, ncert notes for exams"
      />
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                 <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">STUDY HUB</h1>
                 <p className="text-gray-500 font-medium mt-1">Premium resources curated by experts for your success.</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search notes, PDFs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#5B5FFB] outline-none transition-all w-full md:w-80 font-bold text-sm"
                    />
                 </div>
                 <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#5B5FFB] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Layout className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#5B5FFB] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                 </div>
              </div>
           </div>

           {/* Category Chips */}
           <div className="flex flex-wrap gap-3 mt-8">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    selectedCategory === cat 
                    ? 'bg-[#111827] text-gray-900 dark:text-white shadow-xl shadow-black/10' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:border-[#5B5FFB]/30 hover:text-[#5B5FFB]'
                  }`}
                >
                  {cat}
                </button>
              ))}
           </div>
        </header>

        {filteredMaterials.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10 mx-4 sm:mx-6 lg:mx-8">
             <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-gray-400 dark:text-white/20" />
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Study Material Uploaded</h3>
             <p className="text-gray-500 dark:text-white/40 font-medium">Try adjusting your filters or search terms, or check back later.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "flex flex-col gap-4"}>
             <AnimatePresence mode="popLayout">
               {filteredMaterials.map((material, idx) => (
                 <motion.div 
                   key={material.id}
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   transition={{ delay: idx * 0.05 }}
                   className={viewMode === 'grid' 
                     ? "bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative flex flex-col"
                     : "bg-white p-5 rounded-2xl border border-gray-50 shadow-sm flex items-center gap-6 hover:shadow-lg transition-all"
                   }
                 >
                    <div className={viewMode === 'grid' ? "mb-6" : "shrink-0"}>
                       <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner p-4 ${
                          material.category === 'Current Affairs' ? 'bg-blue-50 text-blue-600' :
                          material.category === 'Handwritten Notes' ? 'bg-purple-50 text-purple-600' :
                          material.category === 'E-books' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-gray-50 text-[#5B5FFB]'
                       }`}>
                          <FileText className="w-8 h-8 group-hover:scale-110 transition-transform" />
                       </div>
                    </div>

                    <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{material.category}</span>
                          <div className="flex items-center gap-2">
                             <BookmarkButton itemId={material.id} itemType="Material" itemData={material} />
                          </div>
                       </div>
                       <h3 className="text-lg font-black text-gray-900 mb-2 truncate group-hover:text-[#5B5FFB] transition-colors">{material.title}</h3>
                       <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed mb-6">{material.description}</p>
                       
                       <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                             <Clock className="w-3.5 h-3.5" /> {material.date || 'Recent'}
                          </div>
                          <div className="flex gap-2">
                             {material.fileUrl && (
                               <a 
                                 href={material.fileUrl} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-[#5B5FFB] hover:text-white transition-all shadow-sm"
                                 title="View PDF"
                               >
                                 <Eye className="w-4 h-4" />
                               </a>
                             )}
                             <button 
                               onClick={() => toast.success('Download started...')}
                               className="p-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-[#5B5FFB] hover:text-white transition-all shadow-sm"
                               title="Download"
                             >
                               <Download className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))}
             </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  </>
);
}
