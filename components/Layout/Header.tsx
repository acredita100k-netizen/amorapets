import React, { useState } from 'react';
import { Tab } from '../../types';
import { useData } from '../../contexts/DataContext';

interface HeaderProps {
  onNavigate: (tab: Tab) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [clickCount, setClickCount] = useState(0);
  const { settings } = useData();

  const handleTitleClick = () => {
    setClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        onNavigate('admin');
        return 0;
      }
      return newCount;
    });

    // Reset count if user stops clicking for 2 seconds
    setTimeout(() => setClickCount(0), 2000);
  };

  return (
    <header className="bg-gradient-to-br from-primary to-primary-dark p-5 text-center shadow-lg z-10 select-none">
      <div 
        className="flex justify-center items-center mb-2 cursor-pointer active:scale-95 transition-transform"
        onClick={handleTitleClick}
      >
        <div className="text-3xl mr-3 text-white">
          <i className="fas fa-paw"></i>
        </div>
        <div className="text-2xl font-bold text-white tracking-wide">
          {settings.appName}
        </div>
      </div>
      <div className="text-sm text-white opacity-90 font-medium">
        {settings.tagline}
      </div>
    </header>
  );
};