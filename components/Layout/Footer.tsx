
import React from 'react';
import { useData } from '../../contexts/DataContext';

export const Footer: React.FC = () => {
  const { settings } = useData();

  return (
    <footer className="bg-black text-primary p-6 text-center mt-auto border-t border-zinc-800">
      <div className="space-y-4 mb-6 font-medium">
        <p className="flex flex-col items-center justify-center gap-1">
          <i className="fas fa-phone text-lg text-primary-light"></i> 
          <span className="text-white text-sm font-bold">{settings.phoneDisplay}</span>
        </p>
        <p className="flex flex-col items-center justify-center gap-1">
          <i className="fas fa-map-marker-alt text-lg text-primary-light"></i> 
          <span className="text-white text-xs max-w-xs leading-relaxed">{settings.address}</span>
        </p>
        <p className="flex flex-col items-center justify-center gap-1">
          <i className="fas fa-clock text-lg text-primary-light"></i> 
          <span className="text-white text-xs">{settings.hours}</span>
        </p>
      </div>
      
      <div className="flex justify-center gap-6 mb-6">
        <a href={settings.facebookUrl} className="text-2xl text-primary hover:text-white transition-colors transform hover:scale-110">
          <i className="fab fa-facebook"></i>
        </a>
        <a href={settings.instagramUrl} className="text-2xl text-primary hover:text-white transition-colors transform hover:scale-110">
          <i className="fab fa-instagram"></i>
        </a>
        <a 
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank" 
          rel="noreferrer"
          className="text-2xl text-primary hover:text-white transition-colors transform hover:scale-110"
        >
          <i className="fab fa-whatsapp"></i>
        </a>
      </div>

      <p className="text-white/50 text-[10px] border-t border-zinc-900 pt-4 font-bold tracking-wide">
        {settings.appName} &copy; 2025.<br/>Todos os direitos reservados.
      </p>
    </footer>
  );
};
