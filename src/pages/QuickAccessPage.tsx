import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, Globe, Briefcase, FileBadge, Key, Loader2, Calendar, ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

const pageConfig: Record<string, { title: string; icon: any; iconColor: string }> = {
  '/daily-quiz': { title: "Daily Quiz", icon: Target, iconColor: "text-emerald-500" },
  '/current-affairs': { title: "Current Affairs", icon: Globe, iconColor: "text-purple-500" },
  '/vacancies': { title: "Vacancies", icon: Briefcase, iconColor: "text-amber-500" },
  '/admit-card': { title: "Admit Card", icon: FileBadge, iconColor: "text-blue-500" },
  '/answer-key': { title: "Answer Key", icon: Key, iconColor: "text-rose-500" },
};

export default function QuickAccessPage() {
  const location = useLocation();
  const config = pageConfig[location.pathname] || { title: "Page", icon: Target, iconColor: "text-gray-500" };
  const Icon = config.icon;
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'quickActions');
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allUpdates = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      const filtered = allUpdates
        .filter(update => update.category === config.title && update.published !== false)
        .reverse();
      setItems(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [config.title]);

  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-[#0B1020] pt-10 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${config.iconColor}`} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h1>
          </div>
        </div>
        
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden min-h-[400px]">
          {/* Header row for list */}
          <div className="border-b border-gray-200 dark:border-white/10 p-4 sm:px-6 bg-gray-50 dark:bg-white/[0.02]">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{config.title} Updates</h3>
          </div>
          
          {/* List Content */}
          {loading ? (
            <div className="p-12 flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" />
            </div>
          ) : items.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex gap-4">
                    {item.thumbnail && (
                      <div className="flex-shrink-0">
                        <img loading="lazy" src={item.thumbnail} alt={item.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between gap-2 sm:items-start mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h4>
                        {item.date && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full whitespace-nowrap self-start">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.date}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{item.description}</p>
                      )}
                      {item.content && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 whitespace-pre-wrap">{item.content}</p>
                      )}
                      {item.externalLink && (
                        <a href={item.externalLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-[#5B5FFB] hover:text-[#4A4DCE] transition-colors">
                          View details <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <Icon className={`w-8 h-8 ${config.iconColor} opacity-50`} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No content available.</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                There are currently no items for {config.title}. New updates will appear here once they are published.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
