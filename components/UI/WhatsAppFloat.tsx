
import React from 'react';
import { useData } from '../../contexts/DataContext';

export const WhatsAppFloat: React.FC = () => {
  const { settings } = useData();

  return (
    <a
      href={`https://wa.me/${settings.whatsappNumber}?text=Olá! Gostaria de informações sobre os serviços da ${settings.appName}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 w-16 h-16 bg-black/20 backdrop-blur-md border border-white/20 text-whatsapp rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:scale-110 transition-all duration-300 z-50 animate-bounce-slight"
      aria-label="Fale conosco no WhatsApp"
    >
      <i className="fab fa-whatsapp text-4xl drop-shadow-sm"></i>
    </a>
  );
};
