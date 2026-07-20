import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { APP_VERSION } from '../config/version';

interface VersionData {
  latestVersion: string;
  forceUpdate: boolean;
  apkUrl: string;
}

export default function ForceUpdate({ children }: { children: React.ReactNode }) {
  const [updateRequired, setUpdateRequired] = useState(false);
  const [versionData, setVersionData] = useState<VersionData | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Fetch from the Netlify site. 
        // VITE_UPDATE_URL can be set in .env, or it defaults to /version.json
        const url = import.meta.env.VITE_UPDATE_URL || '/version.json';
        const response = await fetch(`${url}?t=${new Date().getTime()}`, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (response.ok) {
          const data: VersionData = await response.json();
          
          // Basic version comparison: if versions don't match exactly and forceUpdate is true
          // You could use a semver library for > comparison, but strict inequality works 
          // if you always increment the version.
          if (data.latestVersion !== APP_VERSION && data.forceUpdate) {
            setVersionData(data);
            setUpdateRequired(true);
          }
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    checkVersion();
  }, []);

  if (updateRequired && versionData) {
    return (
      <div className="fixed inset-0 z-[100000] bg-white flex flex-col items-center justify-center p-6 text-center overflow-hidden">
        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
          <Download className="w-12 h-12 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Update Required</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          A new version of the app is available. You must update to continue using the application.
        </p>
        <button
          onClick={() => window.location.href = versionData.apkUrl}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-full text-lg w-full max-w-sm transition-colors shadow-lg"
        >
          Update Now
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
