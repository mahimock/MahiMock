import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User as UserIcon, BookOpen, FileQuestion, LogOut, LayoutDashboard, Activity, Trophy, Info, Bookmark, ChevronRight } from 'lucide-react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import toast from 'react-hot-toast';
import GlobalSearch from '../components/GlobalSearch';
import NotificationCenter from '../components/NotificationCenter';
import ThemeToggle from '../components/ThemeToggle';
import ProfileSidebar from '../components/ProfileSidebar';
import SEO from '../components/SEO';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';

import MahiMockLogo from '../components/MahiMockLogo';
import PullToRefresh from 'react-simple-pull-to-refresh';

export default function MainLayout() {
  const { currentUser, userProfile, isAdmin, signOut } = useAuth();
  const { branding } = useBranding();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    // Fetch latest announcement
    const q = query(collection(db, 'notifications_history'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAnnouncement(snapshot.docs[0].data());
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      setProfileOpen(false);
      toast.success('Successfully logged out');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#070B17] text-gray-900 dark:text-white text-gray-900 font-sans selection:bg-[#7C5CFF] selection:text-white">
      <SEO />
      {/* Announcement Ribbon */}
      <div className="bg-[#7C5CFF] text-white text-[10px] sm:text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-3 tracking-widest uppercase relative z-[60]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>{announcement?.title || 'New Test Series Available'}</span>
        </div>
        <span className="opacity-30">|</span>
        <Link to="/test-series" className="hover:text-gray-700 dark:text-white/80 transition-colors underline underline-offset-4">Explore Now</Link>
      </div>

      {/* Premium Mobile App Header */}
      <header className="sticky top-0 z-50 h-[64px] w-full bg-white/70 dark:bg-[#070B18]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.1)] px-4 flex items-center justify-between transition-all duration-300">
        
        {/* Left: Logo & Text */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 active:scale-95 transition-transform shrink-0">
          <div className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] flex items-center justify-center rounded-xl overflow-hidden shrink-0">
             <MahiMockLogo size="sm" variant="dark" showText={false} className="dark:hidden w-full h-full" />
             <MahiMockLogo size="sm" variant="light" showText={false} className="hidden dark:block w-full h-full" />
          </div>
          <span className="text-[15px] sm:text-[18px] font-bold tracking-tight text-gray-900 dark:text-white truncate max-w-[110px] sm:max-w-[150px]">
            {branding.websiteName}
          </span>
        </Link>

        {/* Right side container */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button className="w-[34px] h-[34px] sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-transparent dark:border-white/5 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 active:scale-90 transition-all shrink-0">
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <div className="active:scale-90 transition-transform flex items-center justify-center shrink-0">
            <ThemeToggle />
          </div>
          
          {currentUser && (
            <div className="active:scale-90 transition-transform flex items-center justify-center shrink-0">
              <NotificationCenter />
            </div>
          )}
          
          {currentUser ? (
            <button 
              onClick={() => setProfileOpen(true)}
              className="relative w-[34px] h-[34px] sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#6C4DFF] to-[#3929A3] p-[2px] shadow-[0_0_15px_rgba(108,77,255,0.4)] active:scale-90 transition-all shrink-0"
            >
              <div className="w-full h-full rounded-full bg-white dark:bg-[#070B18] flex items-center justify-center overflow-hidden border border-transparent">
                {userProfile?.photoURL ? (
                  <img loading="lazy" src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6C4DFF] to-[#3929A3]">
                    {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </button>
          ) : (
            <Link to="/login" className="flex items-center justify-center w-[34px] h-[34px] sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#6C4DFF] to-[#3929A3] text-white shadow-[0_0_15px_rgba(108,77,255,0.4)] active:scale-90 transition-all shrink-0">
              <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          )}
        </div>
      </header>
      
      <ProfileSidebar isOpen={profileOpen} onClose={() => setProfileOpen(false)} />

      <main className="pb-20 lg:pb-0 h-full w-full">
        <PullToRefresh onRefresh={async () => {
          window.location.reload();
        }}>
          <div className="min-h-[80vh]">
            <Outlet />
          </div>
        </PullToRefresh>
      </main>

      {/* Premium Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-[100] pb-safe">
        <div className="bg-white/90 dark:bg-[#151521]/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.3)] rounded-[2.5rem] flex items-center justify-around h-[72px] px-2 relative overflow-hidden">
          <Link to="/" className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${location.pathname === '/' ? 'text-[#5B5FFB] scale-105' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'}`}>
            <LayoutDashboard className={`w-6 h-6 mb-1 transition-all ${location.pathname === '/' ? 'fill-[#5B5FFB]/20 drop-shadow-md' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
            {location.pathname === '/' && <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-8 h-1 bg-[#5B5FFB] rounded-t-full" />}
          </Link>
          <Link to="/test-series" className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${location.pathname.startsWith('/test-series') ? 'text-[#5B5FFB] scale-105' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'}`}>
            <FileQuestion className={`w-6 h-6 mb-1 transition-all ${location.pathname.startsWith('/test-series') ? 'fill-[#5B5FFB]/20 drop-shadow-md' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Tests</span>
            {location.pathname.startsWith('/test-series') && <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-8 h-1 bg-[#5B5FFB] rounded-t-full" />}
          </Link>
          <Link to="/study-materials" className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${location.pathname.startsWith('/study-materials') ? 'text-[#5B5FFB] scale-105' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'}`}>
            <BookOpen className={`w-6 h-6 mb-1 transition-all ${location.pathname.startsWith('/study-materials') ? 'fill-[#5B5FFB]/20 drop-shadow-md' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Study</span>
            {location.pathname.startsWith('/study-materials') && <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-8 h-1 bg-[#5B5FFB] rounded-t-full" />}
          </Link>
          <Link to="/updates" className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${location.pathname.startsWith('/updates') ? 'text-[#5B5FFB] scale-105' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'}`}>
            <Bell className={`w-6 h-6 mb-1 transition-all ${location.pathname.startsWith('/updates') ? 'fill-[#5B5FFB]/20 drop-shadow-md' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Updates</span>
            {location.pathname.startsWith('/updates') && <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-8 h-1 bg-[#5B5FFB] rounded-t-full" />}
          </Link>
          <Link to="/profile" className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${location.pathname.startsWith('/profile') ? 'text-[#5B5FFB] scale-105' : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'}`}>
            <UserIcon className={`w-6 h-6 mb-1 transition-all ${location.pathname.startsWith('/profile') ? 'fill-[#5B5FFB]/20 drop-shadow-md' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
            {location.pathname.startsWith('/profile') && <motion.div layoutId="nav-indicator" className="absolute -bottom-1 w-8 h-1 bg-[#5B5FFB] rounded-t-full" />}
          </Link>
        </div>
      </div>



      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
