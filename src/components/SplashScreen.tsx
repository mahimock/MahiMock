import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  isReady: boolean;
}

export default function SplashScreen({ onComplete, isReady }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Wait for at least 2 seconds
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimePassed && isReady && isVisible) {
      setIsVisible(false);
      onComplete();
    }
  }, [minTimePassed, isReady, isVisible, onComplete]);

  if (!isVisible) return null;

  if (hasError) {
    // If the asset cannot be loaded, fail gracefully without showing a broken image icon
    return (
      <div className="fixed inset-0 z-[99999] bg-[#FFFFFF] flex flex-col items-center justify-center overflow-hidden">
        <p className="text-gray-500 font-medium">Please upload the logo to public/logo.png</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-[#FFFFFF] flex items-center justify-center overflow-hidden">
      <div className="w-[90%] sm:w-[85%] md:w-[80%] max-w-[1000px] flex items-center justify-center">
        <img 
          src="/logo.png" 
          alt="MahiMock Logo"
          className="w-full h-auto object-contain"
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}
