import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { Browser } from '@capacitor/browser';

export function useCapacitorHardware() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack || location.pathname === '/') {
          CapacitorApp.exitApp();
        } else {
          navigate(-1);
        }
      });
    }
    if (Capacitor.isNativePlatform()) {
      document.addEventListener('click', (e: any) => {
        const target = e.target.closest('a');
        if (target && target.href && target.target === '_blank') {
          e.preventDefault();
          Browser.open({ url: target.href });
        }
      });
    }
    return () => {
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
      }
    };
  }, [navigate, location]);
}
