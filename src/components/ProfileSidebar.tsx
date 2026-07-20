import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  X, LogOut, Home, LayoutDashboard, User, BookOpen, Bookmark, 
  Bell, Trophy, LineChart, Heart, Settings, Moon, Sun, 
  Languages, Phone, HelpCircle, Info, Shield, FileText, 
  Star, Share2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface ProfileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileSidebar({ isOpen, onClose }: ProfileSidebarProps) {
  const { currentUser, userProfile, isAdmin, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<'English' | 'Hindi'>('English');
  const location = useLocation();
  const navigate = useNavigate();

  // Handle escape key, body scroll, and browser back button
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handlePopState = () => {
      // Close sidebar when back button is pressed
      if (isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // We push state so that the back button triggers popstate instead of navigating away
      window.history.pushState({ sidebarOpen: true }, '');
      window.addEventListener('popstate', handlePopState);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('popstate', handlePopState);
      // Only pop state if we pushed it, but simpler to just let it be or replace it.
      // Usually, if we close it manually, we might want to pop the state if it was the last thing.
      // To prevent navigation bugs, it's safer to just let the history be unless back was pressed.
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!currentUser || !userProfile) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const NavItem = ({ to, icon: Icon, label, badge, adminOnly }: any) => {
    if (adminOnly && !isAdmin) return null;
    
    const isActive = location.pathname === to;
    const isAction = !to.startsWith('/');

    const content = (
      <>
        <Icon className={`w-5 h-5 ${isActive ? 'text-[#5B5FFB]' : 'text-gray-500 dark:text-gray-400 group-hover:text-[#5B5FFB]'} transition-colors`} />
        <span className={`flex-1 font-bold ${isActive ? 'text-[#5B5FFB]' : 'text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{label}</span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full bg-[#5B5FFB]/10 text-[#5B5FFB] text-[10px] font-black uppercase tracking-wider">
            {badge}
          </span>
        )}
      </>
    );

    if (isAction) {
      return (
        <button 
          onClick={() => {
             if (to === 'theme') {
               setTheme(theme === 'dark' ? 'light' : 'dark');
             } else if (to === 'contact') {
               window.location.href = 'mailto:support@mahimock.com';
             } else if (to === 'support') {
               toast.success('Help & Support page coming soon!');
             } else {
               toast.success('Coming soon!');
             }
             onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group relative overflow-hidden"
        >
          {content}
        </button>
      );
    }

    return (
      <Link 
        to={to} 
        onClick={() => {
          onClose(); // ensure closing on navigation
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden ${
          isActive 
            ? 'bg-[#5B5FFB]/10 dark:bg-[#5B5FFB]/20' 
            : 'hover:bg-gray-100 dark:hover:bg-white/5'
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#5B5FFB] rounded-r-full" />
        )}
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm z-[100] transition-all duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-[85%] sm:w-[400px] bg-white/90 dark:bg-[#151521]/90 backdrop-blur-2xl shadow-2xl z-[110] transform transition-transform duration-300 ease-in-out flex flex-col rounded-l-3xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 pb-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#1A1D29]/50 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#5B5FFB]/10 rounded-full blur-[40px] -mr-20 -mt-20 pointer-events-none"></div>
          
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C5CFF] to-[#5B5FFB] p-0.5 shadow-lg shadow-[#5B5FFB]/20">
                <div className="w-full h-full bg-white dark:bg-[#1E1E2D] rounded-2xl overflow-hidden flex items-center justify-center">
                  {userProfile?.photoURL ? (
                    <img loading="lazy" src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] to-[#5B5FFB]">
                      {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                  {userProfile.name || 'User Account'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-40">
                  {currentUser.email}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#5B5FFB]/10 border border-[#5B5FFB]/20">
                  <Star className="w-3 h-3 text-[#5B5FFB] fill-[#5B5FFB]" />
                  <span className="text-[10px] font-black text-[#5B5FFB] uppercase tracking-wider">Premium Member</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-95 shadow-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8 scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
          
          {/* Main Menu */}
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4 mb-3">Main Menu</p>
            <div className="space-y-1">
              <NavItem to="/" icon={Home} label="Home" />
              <NavItem to="/dashboard" icon={LayoutDashboard} label="My Dashboard" />
              <NavItem to="/profile" icon={User} label="My Profile" />
              <NavItem to="/test-series" icon={FileText} label="My Tests" />
              <NavItem to="/study-materials" icon={BookOpen} label="Study Materials" />
              <NavItem to="/saved" icon={Bookmark} label="Bookmarks" />
              <NavItem to="/updates" icon={Bell} label="Notifications" badge="3 New" />
              <NavItem to="/leaderboard" icon={Trophy} label="Achievements" />
              <NavItem to="/performance" icon={LineChart} label="Performance Analytics" />
              <NavItem to="/saved" icon={Heart} label="Favorites" />
            </div>
          </div>

          {/* Preferences */}
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4 mb-3">Preferences</p>
            <div className="space-y-1">
              <NavItem to="/profile" icon={Settings} label="Settings" />
              <NavItem to="theme" icon={theme === 'dark' ? Sun : Moon} label={`${theme === 'dark' ? 'Light' : 'Dark'} Mode`} />
              
              {/* Language Toggle */}
              <button 
                onClick={() => {
                  setLanguage(language === 'English' ? 'Hindi' : 'English');
                  toast.success(`Language changed to ${language === 'English' ? 'Hindi' : 'English'}`);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-all group relative overflow-hidden"
              >
                <Languages className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-[#5B5FFB] transition-colors" />
                <span className="flex-1 text-left font-bold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">Language</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-wider">
                  {language}
                </span>
              </button>
            </div>
          </div>

          {/* Support & About */}
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4 mb-3">Support & Legal</p>
            <div className="space-y-1">
              <NavItem to="contact" icon={Phone} label="Contact Us" />
              <NavItem to="support" icon={HelpCircle} label="Help & Support" />
              <NavItem to="/about" icon={Info} label="About MahiMock" />
              <NavItem to="/privacy-policy" icon={Shield} label="Privacy Policy" />
              <NavItem to="/terms" icon={FileText} label="Terms & Conditions" />
            </div>
          </div>

          {/* Admin */}
          {isAdmin && (
            <div>
              <p className="text-xs font-black text-amber-500 uppercase tracking-widest px-4 mb-3">Admin Panel</p>
              <div className="space-y-1 bg-amber-50 dark:bg-amber-500/5 rounded-2xl p-2 border border-amber-100 dark:border-amber-500/10">
                <NavItem to="/admin" icon={ShieldCheck} label="Admin Dashboard" adminOnly />
              </div>
            </div>
          )}

          {/* Share & Rate */}
          <div>
             <div className="flex gap-2">
               <button onClick={() => {
                 toast.success('Thanks for your feedback!');
                 onClose();
               }} className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Rate App</span>
               </button>
               <button onClick={() => {
                 if (navigator.share) {
                   navigator.share({
                     title: 'MahiMock',
                     url: window.location.origin
                   });
                 }
                 onClose();
               }} className="flex-1 py-3 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all">
                  <Share2 className="w-5 h-5 text-blue-500" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Share App</span>
               </button>
             </div>
          </div>
          
        </div>

        {/* Footer / Logout */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-transparent shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold rounded-2xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
          <p className="text-center text-[10px] font-bold text-gray-400 mt-4 uppercase tracking-widest">
            MahiMock v1.0.0
          </p>
        </div>
      </div>
    </>
  );
}
