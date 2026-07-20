import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import MahiMockLogo from './MahiMockLogo';

export default function AdminRoute() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse mb-4">
          <MahiMockLogo size="xl" showText={false} />
        </div>
        <Loader2 className="w-8 h-8 animate-spin text-[#5B5FFB]" />
      </div>
    );
  }

  const isAdmin = currentUser && userProfile?.role === 'admin';

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
