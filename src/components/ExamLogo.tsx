import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export const ExamLogo = ({ logo, name, className }: { logo?: string, name: string, className?: string }) => {
  const [hasError, setHasError] = useState(false);
  if (!hasError && logo) {
    return (
      <img loading="lazy" 
        src={logo} 
        alt={name} 
        className={className || "w-full h-full object-contain"} 
        onError={() => setHasError(true)}
      />
    );
  }
  return (
    <GraduationCap className={className || "w-full h-full text-gray-400 p-1"} />
  );
};
