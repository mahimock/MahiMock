import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  FileQuestion, 
  Globe, 
  LogOut, 
  Menu,
  X,
  Search,
  History,
  Home,
  Map,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { Users, BarChart3, Bell, Settings, Moon, Sun, Layers, HelpCircle } from 'lucide-react';
import MahiMockLogo from '../components/MahiMockLogo';
import ThemeToggle from '../components/ThemeToggle';
import toast from 'react-hot-toast';

export default function AdminLayout() {
  const { branding } = useBranding();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Categories', path: '/admin/categories', icon: BookOpen },
    { name: 'Exams', path: '/admin/tests', icon: FileQuestion },
    { name: 'Test Series', path: '/admin/test-series', icon: Layers },
    { name: 'Subject Series', path: '/admin/subject-series', icon: Layers },
    { name: 'Section Series', path: '/admin/section-series', icon: Layers },
    { name: 'Question Bank', path: '/admin/question-bank', icon: HelpCircle },
    { name: 'Study Materials', path: '/admin/materials', icon: FileText },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Test Attempts', path: '/admin/attempts', icon: History },
    { name: 'Results', path: '/admin/results', icon: BarChart3 },
    { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
    { name: 'AI Generator', path: '/admin/ai-generator', icon: Sparkles },
    { name: 'Search Manager', path: '/admin/search', icon: Search },
    { name: 'Home Manager', path: '/admin/home-manager', icon: Home },
        { name: 'Current Affairs', path: '/admin/updates', icon: Globe },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Quick Actions', path: '/admin/quick-actions', icon: Sparkles },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];


  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#1E1E2D] border-r border-gray-100 dark:border-gray-800">
      <div className="p-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <MahiMockLogo size="md" variant="dark" showText={false} className="dark:hidden" />
          <MahiMockLogo size="md" variant="light" showText={false} className="hidden dark:flex" />
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tighter text-gray-900 dark:text-white leading-none">
              {branding.websiteName}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#5B5FFB] mt-1">Admin Panel</span>
          </div>
        </Link>
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-blue-50 text-[#5B5FFB]' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#151521]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-gray-900/80 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white dark:bg-[#1E1E2D] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button 
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex-1 lg:hidden text-center flex flex-col items-center justify-center">
              <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white leading-none">
                {branding.websiteName}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#5B5FFB] mt-1">Admin Panel</span>
            </div>
            <div className="flex items-center justify-end w-6 lg:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
