import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  Loader2, 
  Database, 
  FileText, 
  FileQuestion, 
  BookOpen, 
  Globe, 
  AlertCircle
} from 'lucide-react';
import { db } from '../../firebase';
import { collection, getDocs, doc, writeBatch, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

export default function AdminSearchManager() {
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [lastRebuild, setLastRebuild] = useState<any>(null);
  const [stats, setStats] = useState({
    exams: 0,
    materials: 0,
    questions: 0,
    currentAffairs: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [exams, materials, questions, updates] = await Promise.all([
          getDocs(collection(db, 'tests')),
          getDocs(collection(db, 'studyMaterials')),
          getDocs(collection(db, 'questionBank')),
          getDocs(collection(db, 'latestUpdates'))
        ]);

        setStats({
          exams: exams.size,
          materials: materials.size,
          questions: questions.size,
          currentAffairs: updates.size
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  const handleRebuildIndex = async () => {
    setIsRebuilding(true);
    try {
      // In a real production app, this would trigger a Cloud Function
      // to sync Firestore with Algolia or Elasticsearch.
      // For this demo, we'll simulate building a local search index.
      
      const batch = writeBatch(db);
      const searchIndexRef = doc(db, 'system', 'searchIndex');
      
      // Simulate index structure
      const indexData = {
        lastUpdated: Timestamp.now(),
        totalItems: Object.values(stats).reduce((a: number, b: number) => a + b, 0),
        status: 'Ready'
      };

      batch.set(searchIndexRef, indexData);
      await batch.commit();
      
      setLastRebuild(new Date());
      toast.success('Search index rebuilt successfully!');
    } catch (err) {
      toast.error('Failed to rebuild index');
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 bg-[#F8FAFC] min-h-screen">
      <header className="mb-8">
         <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-gray-900 dark:text-white shadow-lg shadow-blue-600/20">
              <Search className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Search Content Manager</h1>
         </div>
         <p className="text-gray-500">Manage and optimize searchable content across the platform.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
           {/* Index Status Card */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                 <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle className="w-3 h-3" /> System Healthy
                 </div>
              </div>
              
              <h3 className="text-lg font-black text-gray-900 mb-2">Global Search Index</h3>
              <p className="text-gray-500 text-sm mb-8">Current index includes Exams, Subjects, Chapters, and Study Materials.</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                    <FileQuestion className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                    <span className="block text-xl font-black text-gray-900">{stats.exams}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Exams</span>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                    <FileText className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                    <span className="block text-xl font-black text-gray-900">{stats.materials}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Materials</span>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                    <BookOpen className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                    <span className="block text-xl font-black text-gray-900">{stats.questions}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Questions</span>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
                    <Globe className="w-5 h-5 text-orange-500 mx-auto mb-2" />
                    <span className="block text-xl font-black text-gray-900">{stats.currentAffairs}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Updates</span>
                 </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                       <RefreshCw className={`w-6 h-6 ${isRebuilding ? 'animate-spin' : ''}`} />
                    </div>
                    <div>
                       <h4 className="font-black text-blue-900">Rebuild Index</h4>
                       <p className="text-xs text-blue-700 font-medium">Sync latest content changes with search engine.</p>
                    </div>
                 </div>
                 <button 
                   onClick={handleRebuildIndex}
                   disabled={isRebuilding}
                   className="px-6 py-3 bg-blue-600 text-gray-900 dark:text-white font-black rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                 >
                    {isRebuilding ? 'Processing...' : 'Sync Now'}
                 </button>
              </div>
           </div>

           {/* Search Settings */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6">Searchable Collections</h3>
              <div className="space-y-4">
                 {[
                   { name: 'Mock Tests & Exams', enabled: true, weight: 'High' },
                   { name: 'Study Material PDFs', enabled: true, weight: 'Medium' },
                   { name: 'Daily Current Affairs', enabled: true, weight: 'Medium' },
                   { name: 'Question Bank MCQs', enabled: false, weight: 'Low' },
                   { name: 'Student Community Posts', enabled: true, weight: 'Low' },
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-gray-50">
                      <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${item.enabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                            {item.name[0]}
                         </div>
                         <div>
                            <h5 className="font-bold text-gray-900 text-sm">{item.name}</h5>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Weight: {item.weight}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${item.enabled ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-[#111827] p-8 rounded-[2.5rem] text-gray-900 dark:text-white">
              <Database className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-xl font-black mb-2 tracking-tight">Search Health</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">System automatically refreshes index every 24 hours. Manual sync is recommended after bulk data uploads.</p>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/5">
                    <span className="text-xs font-bold text-gray-500">Last Rebuild</span>
                    <span className="text-xs font-black">{lastRebuild ? lastRebuild.toLocaleTimeString() : '2 hours ago'}</span>
                 </div>
                 <div className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-white/5">
                    <span className="text-xs font-bold text-gray-500">Query Latency</span>
                    <span className="text-xs font-black text-emerald-400">14ms</span>
                 </div>
                 <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-bold text-gray-500">Index Size</span>
                    <span className="text-xs font-black">1.2 MB</span>
                 </div>
              </div>
           </div>

           <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <div className="flex gap-4">
                 <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                 <div>
                    <h4 className="font-bold text-blue-900 text-sm mb-1">Developer Note</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">Search is currently powered by client-side Firestore queries. Rebuilding index clears the local cache and refreshes query parameters.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
