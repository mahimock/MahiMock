import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  FileQuestion, 
  Clock, 
  Loader2,
  X,
  Layers,
  Book,
  ChevronRight,
  Mic
} from 'lucide-react';
import { collection, query, getDocs, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResult {
  id: string;
  title: string;
  type: 'Category' | 'Exam' | 'Subject' | 'Chapter' | 'Test' | 'PYQ' | 'Material';
  url: string;
  categoryName?: string;
  examName?: string;
}

export default function GlobalSearch({ placeholder = "Search for exams, tests, materials...", className = "", inputClassName = "" }: { placeholder?: string, className?: string, inputClassName?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        performSearch(searchTerm);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (term: string) => {
    setLoading(true);
    const searchLower = term.toLowerCase();
    const allResults: SearchResult[] = [];

    try {
      // 1. Categories
      const catSnap = await getDocs(query(collection(db, 'examCategories'), limit(10)));
      catSnap.forEach(doc => {
        const data = doc.data();
        const name = data.name || data.category || '';
        if (name.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: doc.id,
            title: name,
            type: 'Category',
            url: `/exams/${data.slug || doc.id}`
          });
        }
      });

      // 2. Exams
      const examSnap = await getDocs(query(collection(db, 'exams'), limit(20)));
      examSnap.forEach(doc => {
        const data = doc.data();
        const name = data.examName || '';
        if (name.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: doc.id,
            title: name,
            type: 'Exam',
            url: `/${data.categorySlug || 'exams'}/${data.slug || doc.id}`,
            categoryName: data.category
          });
        }
      });

      // 3. Tests
      const testSnap = await getDocs(query(collection(db, 'tests'), where('status', '==', 'Published'), limit(20)));
      testSnap.forEach(doc => {
        const data = doc.data();
        const title = data.title || '';
        if (title.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: doc.id,
            title: title,
            type: 'Test',
            url: `/test-instructions/${doc.id}`
          });
        }
      });

      // 4. Study Materials
      const matSnap = await getDocs(query(collection(db, 'studyMaterials'), limit(20)));
      matSnap.forEach(doc => {
        const data = doc.data();
        const name = data.name || data.title || '';
        if (name.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: doc.id,
            title: name,
            type: 'Material',
            url: `/study-materials` // Or specific material link if available
          });
        }
      });

      // 5. Subjects
      const subSnap = await getDocs(query(collection(db, 'subjects'), limit(20)));
      subSnap.forEach(doc => {
        const data = doc.data();
        const name = data.name || '';
        if (name.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: doc.id,
            title: name,
            type: 'Subject',
            url: `/exams` // Subjects are usually inside exams
          });
        }
      });

      // 6. Chapters
      const chapSnap = await getDocs(query(collection(db, 'chapters'), limit(20)));
      chapSnap.forEach(doc => {
        const data = doc.data();
        const name = data.name || '';
        if (name.toLowerCase().includes(searchLower)) {
          allResults.push({
            id: doc.id,
            title: name,
            type: 'Chapter',
            url: `/exams` 
          });
        }
      });

      setResults(allResults.slice(0, 15));
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Category': return <Layers className="w-4 h-4 text-orange-500" />;
      case 'Exam': return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'Subject': return <Book className="w-4 h-4 text-purple-500" />;
      case 'Chapter': return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'Test': return <FileQuestion className="w-4 h-4 text-red-500" />;
      case 'Material': return <FileText className="w-4 h-4 text-cyan-500" />;
      default: return <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />;
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative group h-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="h-5 w-5 text-[#5B5FFB] animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-[#5B5FFB] transition-colors" />
          )}
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              // In absence of a dedicated search results page, just close the keyboard by blurring
              e.currentTarget.blur();
            }
          }}
          className={inputClassName ? inputClassName : "block w-full pl-12 pr-10 py-3 border border-gray-200 dark:border-white/10 rounded-2xl leading-5 bg-white dark:bg-[#1E1E2D] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B5FFB] focus:border-transparent text-sm sm:text-base transition-all shadow-sm"} 
          placeholder={placeholder} 
        />
        {searchTerm ? (
          <button 
            onClick={() => { setSearchTerm(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors pointer-events-auto z-10 text-gray-500 dark:text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 transition-colors pointer-events-auto z-10 text-gray-500 dark:text-white/70 dark:hover:text-[#6C4DFF]">
            <Mic className="w-[18px] h-[18px]" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (searchTerm.trim().length >= 2 || loading) && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute mt-2 w-full bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 z-[100] overflow-hidden max-h-[400px] flex flex-col"
          >
            {loading && results.length === 0 ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-[#5B5FFB] animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 font-medium">Searching across MahiMock...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="overflow-y-auto py-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}-${index}`}
                    onClick={() => handleSelect(result)}
                    className="w-full text-left px-4 py-3 hover:bg-[#F8FAFC] dark:bg-[#151521] flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center group-hover:bg-white dark:bg-[#1E1E2D] transition-colors border border-transparent group-hover:border-gray-100 dark:border-white/5 shadow-sm shrink-0">
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#5B5FFB] transition-colors">{result.title}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">{result.type}</span>
                      </div>
                      {result.categoryName && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">{result.categoryName}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            ) : searchTerm.trim().length >= 2 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                   <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">No results found for "{searchTerm}"</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 mb-4">Try different keywords or categories.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setIsOpen(false); }} 
                  className="px-4 py-2 bg-[#5B5FFB]/10 text-[#5B5FFB] hover:bg-[#5B5FFB]/20 rounded-lg text-sm font-semibold transition-colors"
                >
                  Clear Search
                </button>
              </div>
            ) : null}
            
            <div className="p-3 bg-[#F8FAFC] dark:bg-[#151521] border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
               <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Global Smart Search</span>
               <span className="text-[10px] text-gray-400 dark:text-gray-500">Press Esc to close</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
