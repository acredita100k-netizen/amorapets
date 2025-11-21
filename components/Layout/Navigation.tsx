
import React from 'react';
import { Tab } from '../../types';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  // Admin tab is hidden from this list
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'home', label: 'Início', icon: 'fa-home' },
    { id: 'services', label: 'Serviços', icon: 'fa-concierge-bell' },
    { id: 'gallery', label: 'Galeria', icon: 'fa-images' },
    { id: 'schedule', label: 'Agendar', icon: 'fa-calendar-alt' },
    { id: 'about', label: 'Sobre', icon: 'fa-info-circle' },
  ];

  return (
    <nav className="sticky top-0 z-20 bg-black border-b border-primary flex shadow-md overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 min-w-[60px] py-3 text-xs font-medium flex flex-col items-center justify-center transition-all duration-300 border-b-4 focus:outline-none ${
            activeTab === tab.id
              ? 'text-white border-primary bg-white/5'
              : 'text-primary border-transparent hover:bg-white/5 hover:border-primary/50'
          }`}
        >
          <i className={`fas ${tab.icon} mb-1 text-base`}></i>
          {tab.label}
        </button>
      ))}
    </nav>
  );
};