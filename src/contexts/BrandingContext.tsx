import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BrandingSettings, DEFAULT_BRANDING } from '../types';

interface BrandingContextType {
  branding: BrandingSettings;
  loading: boolean;
  updateBranding: (newBranding: Partial<BrandingSettings>) => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [branding, setBranding] = useState<BrandingSettings>(DEFAULT_BRANDING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'branding');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as BrandingSettings;
        setBranding({
          logoUrl: data.logoUrl || DEFAULT_BRANDING.logoUrl,
          websiteName: data.websiteName || DEFAULT_BRANDING.websiteName,
          faviconUrl: data.faviconUrl || DEFAULT_BRANDING.faviconUrl,
          aboutContent: data.aboutContent || DEFAULT_BRANDING.aboutContent,
        });
        
        // Update document title
        if (data.websiteName) {
          document.title = data.websiteName;
        }
        
        // Update favicon
        if (data.faviconUrl) {
          const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (link) {
            link.href = data.faviconUrl;
          } else {
            const newLink = document.createElement('link');
            newLink.rel = 'icon';
            newLink.href = data.faviconUrl;
            document.head.appendChild(newLink);
          }
        }
      } else {
        // If document doesn't exist, use defaults
        setBranding(DEFAULT_BRANDING);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching branding settings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateBranding = async (newBranding: Partial<BrandingSettings>) => {
    const docRef = doc(db, 'settings', 'branding');
    await setDoc(docRef, { ...branding, ...newBranding }, { merge: true });
  };

  const value = React.useMemo(() => ({ branding, loading, updateBranding }), [branding, loading]);

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
