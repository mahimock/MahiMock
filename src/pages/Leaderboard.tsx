import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, ArrowLeft, Trophy, Search, Medal, Clock, Target, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResultDoc {
  id: string;
  userId: string;
  testId: string;
  submittedAt: number;
  score?: number;
  accuracy?: number;
  correct?: number;
  incorrect?: number;
  totalMarks?: number;
  timeTaken?: number;
  answers?: any;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  state?: string;
  district?: string;
}

interface UserRank {
  userId: string;
  name: string;
  photoURL: string;
  state: string;
  district: string;
  totalScore: number;
  avgAccuracy: number;
  totalTimeTaken: number;
  rank: number;
  stateRank?: number;
  districtRank?: number;
}

  type FilterTime = 'Today' | 'This Week' | 'This Month' | 'All Time';
  
  export default function Leaderboard() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    
    const [users, setUsers] = useState<Map<string, UserProfile>>(new Map());
    const [results, setResults] = useState<ResultDoc[]>([]);
    const [tests, setTests] = useState<any[]>([]);
    const [testQuestionsCache, setTestQuestionsCache] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    
    const [timeFilter, setTimeFilter] = useState<FilterTime>('All Time');
    const [examFilter, setExamFilter] = useState('All Exams');
    const [searchQuery, setSearchQuery] = useState('');
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const [uSnap, tSnap] = await Promise.all([
            getDocs(collection(db, 'users')),
            getDocs(collection(db, 'tests'))
          ]);
          
          const uMap = new Map<string, UserProfile>();
          uSnap.forEach(d => uMap.set(d.id, { id: d.id, ...d.data() } as UserProfile));
          setUsers(uMap);
          
          const tList = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setTests(tList);
        } catch (e) {
          console.error(e);
        }
      };
      fetchData();
    }, []);
  
    useEffect(() => {
      const q = query(collection(db, 'results'));
      const unsub = onSnapshot(q, async (snap) => {
        const resList: ResultDoc[] = [];
        const neededTestIds = new Set<string>();
        
        snap.forEach(d => {
          const data = { id: d.id, ...d.data() } as ResultDoc;
          resList.push(data);
          if (typeof data.score === 'undefined') {
            neededTestIds.add(data.testId);
          }
        });
        
        setResults(resList);
        
        let updatedCache = false;
        const newCache: any = {};
        for (const tId of neededTestIds) {
          if (!testQuestionsCache[tId]) {
            try {
              const qSnap = await getDocs(collection(db, 'tests', tId, 'Questions'));
              const qs: any[] = [];
              qSnap.forEach(qd => qs.push({ id: qd.id, ...qd.data() }));
              newCache[tId] = qs;
              updatedCache = true;
            } catch (e) {}
          }
        }
        if (updatedCache) setTestQuestionsCache(prev => ({ ...prev, ...newCache }));
        setLoading(false);
      });
      return () => unsub();
    }, []);
  
    const filteredResults = useMemo(() => {
      const now = Date.now();
      return results.filter(r => {
        // Time Filter
        let timeMatch = true;
        if (timeFilter !== 'All Time') {
          const diff = now - r.submittedAt;
          if (timeFilter === 'Today') timeMatch = diff <= 24 * 60 * 60 * 1000;
          else if (timeFilter === 'This Week') timeMatch = diff <= 7 * 24 * 60 * 60 * 1000;
          else if (timeFilter === 'This Month') timeMatch = diff <= 30 * 24 * 60 * 60 * 1000;
        }

        // Exam Filter
        let examMatch = true;
        if (examFilter !== 'All Exams') {
          examMatch = r.testId === examFilter;
        }

        return timeMatch && examMatch;
      });
    }, [results, timeFilter, examFilter]);

  const rankings = useMemo(() => {
    const userStats = new Map<string, {
      score: number, 
      correct: number, 
      attempted: number, 
      timeTaken: number 
    }>();
    
    filteredResults.forEach(r => {
      let rScore = r.score || 0;
      let rCorrect = r.correct || 0;
      let rIncorrect = r.incorrect || 0;
      let rTimeTaken = r.timeTaken || 0;
      
      // Compute if missing
      if (typeof r.score === 'undefined' && testQuestionsCache[r.testId]) {
        let compScore = 0;
        let compCorrect = 0;
        let compIncorrect = 0;
        const qs = testQuestionsCache[r.testId];
        qs.forEach((q: any) => {
          const ans = r.answers?.[q.id];
          if (ans) {
            if (ans === q.correctAnswer) {
              compScore += (Number(q.marks) || 0);
              compCorrect++;
            } else {
              compScore -= (Number(q.negativeMarks) || 0);
              compIncorrect++;
            }
          }
        });
        rScore = Math.max(0, compScore);
        rCorrect = compCorrect;
        rIncorrect = compIncorrect;
      }
      
      const rAttempted = rCorrect + rIncorrect;
      
      const existing = userStats.get(r.userId) || { score: 0, correct: 0, attempted: 0, timeTaken: 0 };
      userStats.set(r.userId, {
        score: existing.score + rScore,
        correct: existing.correct + rCorrect,
        attempted: existing.attempted + rAttempted,
        timeTaken: existing.timeTaken + rTimeTaken
      });
    });
    
    const ranks: UserRank[] = [];
    userStats.forEach((stats, userId) => {
      const u = users.get(userId);
      const name = u?.name || 'Unknown User';
      const accuracy = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0;
      
      ranks.push({
        userId,
        name,
        photoURL: u?.photoURL || '',
        state: u?.state || '',
        district: (u as any)?.district || '',
        totalScore: stats.score,
        avgAccuracy: accuracy,
        totalTimeTaken: stats.timeTaken,
        rank: 0, // Set below
      });
    });
    
    // Sort
    ranks.sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      if (b.avgAccuracy !== a.avgAccuracy) return b.avgAccuracy - a.avgAccuracy;
      return a.totalTimeTaken - b.totalTimeTaken; // Lowest time is better
    });
    
    // Assign ranks
    ranks.forEach((r, idx) => r.rank = idx + 1);
    
    // Assign state ranks
    const stateGroups = new Map<string, UserRank[]>();
    const districtGroups = new Map<string, UserRank[]>();

    ranks.forEach(r => {
      if (r.state) {
        const group = stateGroups.get(r.state) || [];
        group.push(r);
        stateGroups.set(r.state, group);
      }
      if (r.district) {
        const dKey = `${r.state}_${r.district}`;
        const group = districtGroups.get(dKey) || [];
        group.push(r);
        districtGroups.set(dKey, group);
      }
    });
    
    stateGroups.forEach(group => {
      group.forEach((r, idx) => r.stateRank = idx + 1);
    });

    districtGroups.forEach(group => {
      group.forEach((r, idx) => r.districtRank = idx + 1);
    });
    
    return ranks;
  }, [filteredResults, users, testQuestionsCache]);

  const displayRankings = useMemo(() => {
    return rankings.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rankings, searchQuery]);
  
  const currentUserRank = currentUser ? rankings.find(r => r.userId === currentUser.uid) : null;

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-[#F8FAFC]"><Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" /></div>;
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return 'N/A';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#5B5FFB]" /> 
                Global Leaderboard
              </h1>
              <p className="text-sm text-gray-500">Compare your performance with students across India</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-48">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select 
                value={examFilter}
                onChange={e => setExamFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B5FFB] text-sm shadow-sm appearance-none font-bold"
              >
                <option value="All Exams">All Exams</option>
                {tests.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search student..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B5FFB] text-sm shadow-sm"
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                {(['Today', 'This Week', 'This Month', 'All Time'] as FilterTime[]).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeFilter(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      timeFilter === tf ? 'bg-[#5B5FFB] text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Top 3 Podium */}
        {displayRankings.length > 0 && !searchQuery && (
          <div className="flex justify-center items-end gap-2 sm:gap-6 mb-12 mt-8 h-48">
            {/* Rank 2 */}
            {displayRankings[1] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-500">
                <div className="relative mb-2">
                  {displayRankings[1].photoURL ? (
                    <img loading="lazy" src={displayRankings[1].photoURL} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white text-xl font-bold text-gray-500">
                      {displayRankings[1].name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 border-2 border-white shadow-sm">
                    2
                  </div>
                </div>
                <div className="w-24 h-24 bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg border border-gray-300 flex flex-col items-center justify-center shadow-inner">
                  <span className="font-bold text-gray-800 text-sm truncate w-20 text-center">{displayRankings[1].name.split(' ')[0]}</span>
                  <span className="text-xs font-bold text-gray-500">{displayRankings[1].totalScore.toFixed(1)}</span>
                </div>
              </div>
            )}
            
            {/* Rank 1 */}
            {displayRankings[0] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-12 duration-700 z-10">
                <Medal className="w-8 h-8 text-yellow-500 mb-1 drop-shadow-md" />
                <div className="relative mb-2">
                  {displayRankings[0].photoURL ? (
                    <img loading="lazy" src={displayRankings[0].photoURL} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center border-4 border-yellow-400 text-2xl font-bold text-yellow-600">
                      {displayRankings[0].name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white border-2 border-white shadow-sm">
                    1
                  </div>
                </div>
                <div className="w-28 h-32 bg-gradient-to-t from-yellow-200 to-yellow-100 rounded-t-lg border border-yellow-300 flex flex-col items-center justify-start pt-4 shadow-inner">
                  <span className="font-bold text-gray-900 text-base truncate w-24 text-center">{displayRankings[0].name.split(' ')[0]}</span>
                  <span className="text-sm font-extrabold text-yellow-700">{displayRankings[0].totalScore.toFixed(1)}</span>
                </div>
              </div>
            )}
            
            {/* Rank 3 */}
            {displayRankings[2] && (
              <div className="flex flex-col items-center animate-in slide-in-from-bottom-4 duration-300">
                <div className="relative mb-2">
                  {displayRankings[2].photoURL ? (
                    <img loading="lazy" src={displayRankings[2].photoURL} alt="" className="w-14 h-14 rounded-full object-cover border-4 border-amber-600/30" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center border-4 border-white text-lg font-bold text-amber-700">
                      {displayRankings[2].name.charAt(0)}
                    </div>
                  )}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-amber-600 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-900 dark:text-white border-2 border-white shadow-sm">
                    3
                  </div>
                </div>
                <div className="w-20 h-20 bg-gradient-to-t from-amber-100 to-amber-50 rounded-t-lg border border-amber-200 flex flex-col items-center justify-center shadow-inner">
                  <span className="font-bold text-gray-800 text-xs truncate w-16 text-center">{displayRankings[2].name.split(' ')[0]}</span>
                  <span className="text-xs font-bold text-amber-700">{displayRankings[2].totalScore.toFixed(1)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Highlight Current User if not in current view or specifically to show context */}
        {currentUserRank && (
          <div className="bg-gradient-to-r from-[#5B5FFB] to-purple-600 rounded-2xl shadow-lg p-1 mb-6 animate-in fade-in">
            <div className="bg-gray-200 dark:bg-white/10 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-gray-900 dark:text-white">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  #{currentUserRank.rank}
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your Current Ranking</h3>
                  <div className="flex gap-4 text-sm text-gray-900 dark:text-white/80 font-medium">
                    <span>{currentUserRank.totalScore.toFixed(2)} Score</span>
                    <span>•</span>
                    <span>{currentUserRank.avgAccuracy.toFixed(1)}% Acc</span>
                    {currentUserRank.state && (
                      <>
                        <span>•</span>
                        <span>State: #{currentUserRank.stateRank}</span>
                      </>
                    )}
                    {currentUserRank.district && (
                      <>
                        <span>•</span>
                        <span>District: #{currentUserRank.districtRank}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => navigate('/test-series')} className="px-5 py-2 bg-white text-[#5B5FFB] font-bold rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap text-sm shadow-sm">
                Improve Rank
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-right">Score</th>
                  <th className="px-6 py-4 text-right">Accuracy</th>
                  <th className="px-6 py-4 text-right">Time Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayRankings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No results found for this period.
                    </td>
                  </tr>
                ) : (
                  displayRankings.map((r) => (
                    <tr 
                      key={r.userId} 
                      className={`hover:bg-gray-50/50 transition-colors ${r.userId === currentUser?.uid ? 'bg-blue-50/30' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                            r.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                            r.rank === 2 ? 'bg-gray-200 text-gray-700' :
                            r.rank === 3 ? 'bg-amber-100 text-amber-700' :
                            'text-gray-500'
                          }`}>
                            {r.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {r.photoURL ? (
                            <img loading="lazy" src={r.photoURL} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                              {r.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-2">
                              {r.name}
                              {r.userId === currentUser?.uid && <span className="text-[10px] bg-[#5B5FFB] text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">You</span>}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-medium text-gray-500">
                              {r.state && <span>S: #{r.stateRank}</span>}
                              {r.district && <span>• D: #{r.districtRank}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-bold text-gray-900">{r.totalScore.toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5 text-gray-600 font-medium">
                          <Target className="w-4 h-4 text-green-500" /> {r.avgAccuracy.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5 text-gray-500 font-medium text-sm">
                          <Clock className="w-4 h-4" /> {formatTime(r.totalTimeTaken)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}
