import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import SEO from '../components/SEO';
import { Loader2, Bell, Calendar, ChevronRight } from 'lucide-react';

export default function Updates() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'latestUpdates'), orderBy('date', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpdates(fetched.filter(c => c.id !== '_init'));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Current Affairs & Latest Updates | MahiMock" 
        description="Stay updated with the latest government job notifications, admit cards, exam results, and daily current affairs for competitive exams."
        path="/updates"
        keywords="current affairs, govt job notifications, admit card, exam results, daily news for ssc upsc"
      />
      
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center">
             <h1 className="text-4xl font-black text-gray-900 tracking-tight italic mb-2">EXAM UPDATES</h1>
             <p className="text-gray-500 font-medium">Real-time notifications for jobs, admit cards, and results.</p>
          </header>

          {updates.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10 mx-4 sm:mx-6 lg:mx-8">
              <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-gray-400 dark:text-white/20" />
              </div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Notifications Available</h3>
              <p className="text-gray-500 dark:text-white/40 font-medium">We are constantly monitoring exam notifications. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-6">
               {updates.map((update) => (
                 <div key={update.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-start gap-6">
                       <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Bell className="w-6 h-6" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">{update.category || 'Notification'}</span>
                             <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold ml-auto">
                                <Calendar className="w-3 h-3" /> {update.date}
                             </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-[#5B5FFB] transition-colors">{update.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{update.description}</p>
                          
                          {update.link && (
                            <a 
                              href={update.link} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 mt-4 text-xs font-black text-[#5B5FFB] uppercase tracking-widest hover:underline"
                            >
                              Read More <ChevronRight className="w-3 h-3" />
                            </a>
                          )}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
