import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from './SplashScreen';

export default function Bootstrapper({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSplashComplete = () => {
    setShowSplash(false);
    
    if (currentUser) {
      // Check for email verification
      if (currentUser.email && !currentUser.emailVerified && location.pathname !== '/verify-email') {
        navigate('/verify-email', { replace: true });
        return;
      }
      
      // If logged in and on an auth page or root, go to home
      if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/verify-email') {
        if (!currentUser.email || currentUser.emailVerified) {
          navigate('/', { replace: true });
        }
      }
    } else {
      // If not logged in and not on a public auth page, go to login
      if (location.pathname !== '/signup' && location.pathname !== '/forgot-password') {
        navigate('/login', { replace: true });
      }
    }
  };

  return (
    <>
      {showSplash && <SplashScreen isReady={!loading} onComplete={handleSplashComplete} />}
      {children}
    </>
  );
}
