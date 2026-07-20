import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  ArrowLeft, FileQuestion, Clock, PlayCircle, Loader2, Search, Bell, 
  BarChart3, Hash, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function SubjectSeriesDetail() {
  const { currentUser } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [series, setSeries] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [userAttempts, setUserAttempts] = useState<Set<string>>(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const seriesDoc = await getDoc(doc(db, 'subjectSeries', id));
        if (!seriesDoc.exists()) {
          setSeries(null);
          setLoading(false);
          return;
        }
        setSeries({ id: seriesDoc.id, ...seriesDoc.data() });

        // Fetch topics
        const topicsQ = query(
          collection(db, 'subjectTopics'), 
          where('subjectSeriesId', '==', id)
        );
        const topicsSnap = await getDocs(topicsQ);
        const fetchedTopics = topicsSnap.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter(t => t.isActive !== false);
        
        // Sort in memory
        fetchedTopics.sort((a, b) => (a.order || 0) - (b.order || 0));
        setTopics(fetchedTopics);

        // Fetch tests
        if (currentUser) {
          const resultsQ = query(
            collection(db, 'results'),
            where('userId', '==', currentUser.uid)
          );
          const resultsSnap = await getDocs(resultsQ);
          const attemptedTestIds = new Set<string>();
          resultsSnap.forEach(d => {
            attemptedTestIds.add(d.data().testId);
          });
          setUserAttempts(attemptedTestIds);
        }

        const tQ = query(
          collection(db, 'tests'), 
          where('subjectSeriesId', '==', id), 
          where('status', '==', 'Published')
        );
        const tSnap = await getDocs(tQ);
        const fetchedTests = tSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
        
        // Sort tests by displayOrder or order
        fetchedTests.sort((a, b) => {
          const orderA = a.displayOrder ?? a.order ?? 0;
          const orderB = b.displayOrder ?? b.order ?? 0;
          return orderA - orderB;
        });
        setTests(fetchedTests);

        // Handle initial topic selection
        const topicParam = new URLSearchParams(location.search).get('topic');
        if (topicParam && fetchedTopics.some(t => t.id === topicParam)) {
          setSelectedTopicId(topicParam);
        } else if (fetchedTopics.length > 0) {
          setSelectedTopicId(fetchedTopics[0].id);
        }
      } catch (error) {
        console.error("Error fetching subject details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, currentUser]);

  // Update selected topic if URL changes externally
  useEffect(() => {
    const topicParam = new URLSearchParams(location.search).get('topic');
    if (topicParam && topicParam !== selectedTopicId) {
      setSelectedTopicId(topicParam);
    }
  }, [location.search, selectedTopicId]);

  const filteredTopics = useMemo(() => {
    return topics.filter(topic => 
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  const currentTopic = useMemo(() => {
    return topics.find(t => t.id === selectedTopicId) || topics[0];
  }, [topics, selectedTopicId]);

  const currentTests = useMemo(() => {
    if (!currentTopic) return [];
    return tests.filter(t => t.subjectTopicId === currentTopic.id)
      .sort((a, b) => {
        const sA = a.serialNumber ?? a.displayOrder ?? a.order ?? 0;
        const sB = b.serialNumber ?? b.displayOrder ?? b.order ?? 0;
        if (sA !== sB) return sA - sB;
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
  }, [tests, currentTopic]);

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    navigate(`/subject-series/${id}?topic=${topicId}`, { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0B1020] text-gray-900 dark:text-white font-hindi">
        <header className="h-16 bg-white dark:bg-[#0B1020]/90 border-b border-gray-200 dark:border-white/5 flex items-center px-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          <div className="ml-4 h-6 w-32 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="h-12 w-48 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-[20px] animate-pulse" />
          ))}
        </main>
      </div>
    );
  }

  if (!series) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B1020] text-gray-900 dark:text-white font-hindi">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0B1020]/90 backdrop-blur-2xl border-b border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button 
              onClick={() => navigate('/subject-series')}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-black tracking-tight truncate">
                {series.name}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 transition-all">
              <Search className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 transition-all">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar (Optional inline) */}
        {searchQuery && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder="खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Active Tab Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="inline-flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
            <button className="px-8 py-3 rounded-xl bg-blue-600 text-gray-900 dark:text-white text-base font-bold shadow-lg shadow-blue-600/20">
              अध्यायवार टेस्ट
            </button>
          </div>
        </div>

        {/* Horizontal Topic Selector */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
          {topics.map((topic, index) => (
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic.id)}
              className={`flex-none px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
                selectedTopicId === topic.id 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-600/20' 
                  : 'bg-gray-100 dark:bg-white/5 text-gray-500 border-gray-200 dark:border-white/5 hover:border-gray-200 dark:border-white/10'
              }`}
            >
              अध्याय {String(index + 1).padStart(2, '0')}
            </button>
          ))}
        </div>

        {/* Chapters/Tests List */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {currentTopic ? (
              
                <div key={currentTopic.id || "empty"}>
                {/* Topic Info */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  key={`info-${currentTopic.id}`}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    {currentTopic.name}
                  </h2>
                  {currentTopic.description && (
                    <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                      {currentTopic.description}
                    </p>
                  )}
                </motion.div>

                {currentTests.length > 0 ? (
                  currentTests.map((test, testIndex) => {
                    const topicIndex = topics.findIndex(t => t.id === currentTopic.id);
                    const chapterNumber = String(topicIndex + 1).padStart(2, '0');
                    const hasAttempted = userAttempts.has(test.id);

                    return (
                      <motion.div
                        key={test.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white/[0.03] backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-4 sm:p-4.5 hover:border-blue-500/30 transition-all group relative overflow-hidden shadow-xl"
                      >
                        {/* Ripple Effect Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                          {/* Chapter Badge - Slightly Smaller */}
                          <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex flex-col items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-gray-900 dark:hover:text-white transition-all duration-300">
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">CH</span>
                            <span className="text-lg font-black leading-none">{chapterNumber}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1.5 leading-tight tracking-tight group-hover:text-blue-400 transition-colors truncate">
                              {test.title}
                            </h3>
                            
                            {/* Stats Row - Compact horizontal alignment */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                <FileQuestion className="w-3 h-3 text-blue-400/70" />
                                <span>{test.questionsCount || 0} Questions</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                <BarChart3 className="w-3 h-3 text-purple-400/70" />
                                <span>{test.marks || (test.questionsCount * 1) || 0} Marks</span>
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                <Clock className="w-3 h-3 text-blue-400/70" />
                                <span>{test.durationMinutes || 0} Min</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Button - Smaller & Right Aligned */}
                          <div className="shrink-0 sm:ml-auto">
                            <button
                              onClick={() => navigate(`/test-instructions/${test.id}`)}
                              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/10 hover:shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                              {hasAttempted ? '🔄 REATTEMPT' : '✅ START TEST'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center bg-white/[0.02] rounded-[2rem] border border-dashed border-gray-200 dark:border-white/10"
                  >
                    <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileQuestion className="w-8 h-8 text-gray-700" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-1">इस अध्याय में अभी कोई टेस्ट उपलब्ध नहीं है।</h3>
                    <p className="text-sm text-gray-500 uppercase font-black tracking-widest italic">New tests coming soon</p>
                  </motion.div>
                )}
              
                </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                  <Hash className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">अभी कोई अध्याय उपलब्ध नहीं है</h3>
                <p className="text-sm text-gray-500">कृपया बाद में पुनः प्रयास करें।</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-hindi {
          font-family: 'Noto Sans Devanagari', 'Inter', sans-serif;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

