import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Loader2, Info, FileText, GraduationCap } from 'lucide-react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'test' | 'material' | 'exam' | 'general';
  read: boolean;
  createdAt: number;
  link?: string;
}

export default function NotificationCenter() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'users', currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: Notification[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as Notification));
      setNotifications(list);
      setLoading(false);
    }, (error) => {
      console.error('Notification error:', error);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    if (!currentUser || unreadCount === 0) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      const ref = doc(db, 'users', currentUser.uid!, 'notifications', n.id);
      batch.update(ref, { read: true });
    });
    await batch.commit();
  };

  const deleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'notifications', id));
    } catch(err) {}
  };
  
  const deleteAllNotifications = async () => {
    if (!currentUser || notifications.length === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, 'users', currentUser.uid, 'notifications', n.id));
      });
      await batch.commit();
    } catch(err) {}
  };
  
  const markAsRead = async (id: string) => {
    if (!currentUser) return;
    await updateDoc(doc(db, 'users', currentUser.uid, 'notifications', id), { read: true });
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'test': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'material': return <Info className="w-4 h-4 text-purple-500" />;
      case 'exam': return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500 dark:text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) markAllAsRead();
        }}
        className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-[#5B5FFB] transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-[#1E1E2D] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 z-[60] overflow-hidden flex flex-col max-h-[500px]"
          >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-white/5/50 dark:bg-white/5">
               <div>
                 <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">MahiMock Alerts</p>
               </div>
                              <div className="flex gap-3 items-center">
                 {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold">{unreadCount} New</span>}
                 {unreadCount > 0 && <button onClick={(e) => { e.stopPropagation(); markAllAsRead(); }} className="text-[10px] text-[#5B5FFB] hover:underline font-bold">Mark all read</button>}
                 {notifications.length > 0 && <button onClick={(e) => { e.stopPropagation(); deleteAllNotifications(); }} className="text-[10px] text-red-500 hover:underline font-bold">Clear all</button>}
               </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5B5FFB] mx-auto" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-1">We'll notify you about new tests and materials.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`relative p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-500/10' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-transparent transition-all group-hover:scale-110 shadow-sm ${
                            !n.read ? 'bg-white dark:bg-[#1E1E2D] border-blue-100 dark:border-blue-500/20' : 'bg-gray-50 dark:bg-white/5'
                        }`}>
                          {getIcon(n.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                             <p className={`text-sm font-bold truncate ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-700'}`}>{n.title}</p>
                             <span className="text-[10px] text-gray-400 whitespace-nowrap">
                               {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                             </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{n.message}</p>
                          <button onClick={(e) => deleteNotification(e, n.id)} className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"><X className="w-3 h-3" /></button>
                          {n.link && (
                             <a 
                               href={n.link} 
                               className="inline-block mt-2 text-[10px] font-bold text-[#5B5FFB] hover:underline"
                               onClick={(e) => e.stopPropagation()}
                             >
                               View Details →
                             </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-[#F8FAFC] dark:bg-white/5 border-t border-gray-100 dark:border-white/5 text-center">
               <button className="text-[10px] font-bold text-gray-400 hover:text-[#5B5FFB] uppercase tracking-widest transition-colors">
                 View All Notifications
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
