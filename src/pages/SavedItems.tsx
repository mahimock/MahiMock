import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Bookmark, FileText, BookOpen, Clock, ChevronRight, Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface BookmarkedItem {
  id: string;
  itemId: string;
  itemType: 'Test' | 'Material' | 'Chapter';
  itemData: any;
  createdAt: number;
}

export default function SavedItems() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState<BookmarkedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Test' | 'Material' | 'Chapter'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'bookmarks'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: BookmarkedItem[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as BookmarkedItem));
      setItems(list);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'All' || item.itemType === filter;
    const title = item.itemData?.title || item.itemData?.name || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="mb-8">
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-[#5B5FFB] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#5B5FFB]/20">
               <Bookmark className="w-5 h-5 fill-current" />
             </div>
             <h1 className="text-3xl font-bold text-gray-900">Saved Items</h1>
           </div>
           <p className="text-gray-500">Access all your bookmarked tests, chapters and study materials in one place.</p>
        </header>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
             <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search in bookmarks..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5B5FFB] shadow-sm"
             />
          </div>
          <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-gray-200">
            {(['All', 'Test', 'Material', 'Chapter'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  filter === f ? 'bg-[#5B5FFB] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {f}s
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-gray-200" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No bookmarks found</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Items you bookmark will appear here for quick access later.</p>
            <Link to="/test-series" className="inline-flex items-center gap-2 px-6 py-3 bg-[#5B5FFB] text-white font-bold rounded-2xl hover:bg-[#4A4DE0] transition-colors shadow-lg shadow-[#5B5FFB]/20">
               Explore Content
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  key={item.id}
                  className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.itemType === 'Test' ? 'bg-blue-50 text-blue-600' :
                      item.itemType === 'Material' ? 'bg-purple-50 text-purple-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {item.itemType === 'Test' ? <FileText className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{item.itemType}</span>
                         <span className="text-gray-300">•</span>
                         <span className="text-[10px] font-bold text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                       </div>
                       <h3 className="text-base font-bold text-gray-900 group-hover:text-[#5B5FFB] transition-colors truncate mb-2">
                         {item.itemData?.title || item.itemData?.name}
                       </h3>
                       <Link 
                        to={item.itemType === 'Test' ? `/test-instructions/${item.itemId}` : '/study-materials'}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B5FFB] hover:gap-2 transition-all"
                       >
                         View Details <ChevronRight className="w-3 h-3" />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
