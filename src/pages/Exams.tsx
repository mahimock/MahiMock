import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, getCountFromServer, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Loader2, FolderOpen } from 'lucide-react';
import SEO from '../components/SEO';

const CATEGORY_COLORS = [
  'bg-gradient-to-br from-blue-500 to-indigo-600',
  'bg-gradient-to-br from-emerald-500 to-teal-600',
  'bg-gradient-to-br from-purple-500 to-fuchsia-600',
  'bg-gradient-to-br from-rose-500 to-red-600',
  'bg-gradient-to-br from-amber-500 to-orange-600',
  'bg-gradient-to-br from-cyan-500 to-blue-600',
];

const ExamLogo = ({ logo, name }: { logo: string, name: string }) => {
  const [error, setError] = useState(false);
  
  if (!logo || error) {
    return <span className="text-xl font-bold text-gray-800">{name?.charAt(0) || 'E'}</span>;
  }
  
  return (
    <img 
      src={logo} 
      alt={name} 
      className="w-full h-full object-contain"
      onError={() => setError(true)}
    />
  );
};

export default function Exams() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, 'examCategories'));
        const snapshot = await getDocs(q);
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.id !== '_init');
        
        // Fetch test counts for each category
        const catsWithCounts = await Promise.all(cats.map(async (cat: any) => {
          let testCount = 0;
          try {
            // Count tests where categoryId equals the category's id and status is Published
            const testsQuery = query(
              collection(db, 'tests'), 
              where('categoryId', '==', cat.id),
              where('status', '==', 'Published')
            );
            const countSnapshot = await getCountFromServer(testsQuery);
            testCount = countSnapshot.data().count;
          } catch (e) {
            console.error('Error fetching count for category:', cat.id, e);
          }
          return { ...cat, testCount };
        }));
        
        // Sort by display order
        catsWithCounts.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setCategories(catsWithCounts);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat => 
    (cat.name || cat.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEO 
        title="Explore Exams | MahiMock - Comprehensive Exam Coverage" 
        description="Find mock tests and study materials for UPSC, SSC, Banking, Railways, Teaching, and State PCS exams. Start your preparation with the right resources."
        path="/exams"
      />
      <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Explore All Exams
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Browse through our comprehensive collection of test series and study materials designed specifically for your target exams.
          </p>
          
          <div className="max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#5B5FFB] transition-colors" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B5FFB] focus:border-transparent text-base shadow-sm transition-all" 
              placeholder="Search for SSC, UPSC, Banking..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#5B5FFB]" />
            <p className="text-gray-500 font-medium">Loading exams...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10 mx-4 sm:mx-6 lg:mx-8 mt-8">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-10 h-10 text-gray-400 dark:text-white/20" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Exam Categories Added</h3>
            <p className="text-gray-500 dark:text-white/40 font-medium max-w-md">We are currently preparing high-quality exam materials. Please check back later.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10 mx-4 sm:mx-6 lg:mx-8 mt-8">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
               <Search className="w-10 h-10 text-gray-400 dark:text-white/20" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No results found</h3>
            <p className="text-gray-500 dark:text-white/40 font-medium max-w-md">We couldn't find any exams matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-4 text-sm text-[#5B5FFB] font-bold hover:underline uppercase tracking-widest"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category, index) => {
              const gradientClass = category.gradient || category.gradientColor || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
              
              return (
                <Link 
                  to={`/exams/${category.slug || category.id}`}
                  key={category.id} 
                  className={`rounded-[24px] p-6 flex flex-col shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group ${gradientClass}`}
                >
                  {/* Decorative circle for style */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200 dark:bg-white/10 rounded-full -mr-12 -mt-12 pointer-events-none transition-transform group-hover:scale-110 duration-500"></div>
                  
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm p-2 overflow-hidden mb-5 relative z-10 shrink-0">
                    <ExamLogo logo={category.logoUrl || category.logo} name={category.name || category.category} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight group-hover:scale-105 transform origin-left transition-transform">
                      {category.name || category.category}
                    </h3>
                    <p className="text-gray-900 dark:text-white/80 text-sm mb-6 line-clamp-2">
                      {category.description || `Prepare for ${category.name || category.category} exams with our expert materials.`}
                    </p>
                    
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-300 dark:border-white/20">
                      <span className="text-gray-900 dark:text-white/90 text-sm font-medium flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" /> 
                        {category.testCount} {category.testCount === 1 ? 'Test' : 'Tests'}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white transition-colors">
                        <ArrowRight className="w-4 h-4 text-gray-900 dark:text-white group-hover:text-gray-900 transition-colors" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </>
);
}
