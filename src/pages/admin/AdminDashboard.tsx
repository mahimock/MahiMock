import React, { useState, useEffect } from 'react';
import { collection, getCountFromServer, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Users, BookOpen, FileText, FileQuestion, Globe, Loader2, Search, History, RotateCcw, Database, Sparkles } from 'lucide-react';
import { seedInitialContent } from '../../utils/seedData';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    materials: 0,
    tests: 0,
    updates: 0,
    users: 0,
    attempts: 0,
    reattempts: 0,
    searchableItems: 0
  });
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    if (!window.confirm('This will populate default exam categories and sample data. Continue?')) return;
    setIsSeeding(true);
    try {
      await seedInitialContent();
      toast.success('Initial content seeded successfully!');
    } catch (err) {
      toast.error('Failed to seed content');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleOptimize = () => {
    // Clear local cache
    localStorage.clear();
    toast.success('System optimization complete! Cache cleared.');
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        const [
          categoriesCount, 
          materialsCount, 
          testsCount, 
          updatesCount, 
          usersCount,
          attemptsCount,
          reattemptsCount
        ] = await Promise.all([
          getCountFromServer(collection(db, 'examCategories')),
          getCountFromServer(collection(db, 'studyMaterials')),
          getCountFromServer(collection(db, 'tests')),
          getCountFromServer(collection(db, 'latestUpdates')),
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'results')),
          getCountFromServer(query(collection(db, 'results'), where('attemptNumber', '>', 1)))
        ]);

        const c = categoriesCount.data().count;
        const m = materialsCount.data().count;
        const t = testsCount.data().count;
        const u = updatesCount.data().count;

        setStats({
          categories: c,
          materials: m,
          tests: t,
          updates: u,
          users: usersCount.data().count,
          attempts: attemptsCount.data().count,
          reattempts: reattemptsCount.data().count,
          searchableItems: c + m + t + u
        });

      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Searchable Items', value: stats.searchableItems, icon: Search, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { title: 'Test Attempts', value: stats.attempts, icon: History, color: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
    { title: 'Total Reattempts', value: stats.reattempts, icon: RotateCcw, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { title: 'Study Materials', value: stats.materials, icon: FileText, color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { title: 'Total Updates', value: stats.updates, icon: Globe, color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome to the MahiMock Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1E1E2D] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Tools</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">System maintenance and data management utilities.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleOptimize}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all text-sm font-bold"
            >
              <Sparkles className="w-4 h-4" /> Optimize
            </button>
            <button 
              disabled={isSeeding}
              onClick={handleSeed}
              className="flex items-center gap-2 px-4 py-2 bg-[#5B5FFB] text-white rounded-xl hover:bg-indigo-600 transition-all text-sm font-bold disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Seed Data
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-[#151521] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-[#5B5FFB] dark:hover:border-[#5B5FFB]">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Categories</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Add or edit exam categories to keep your offerings up to date.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#151521] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-[#5B5FFB] dark:hover:border-[#5B5FFB]">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Materials</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Upload new study notes, syllabus, and previous year papers.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#151521] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-[#5B5FFB] dark:hover:border-[#5B5FFB]">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Mock Tests</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Create new mock tests and set their questions and time limits.</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-[#151521] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-[#5B5FFB] dark:hover:border-[#5B5FFB]">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Updates</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Post the latest news, exam notifications, and current affairs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
