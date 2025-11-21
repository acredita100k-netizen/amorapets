import React from 'react';
import { Tab } from '../types';
import { Card } from '../components/UI/Card';
import { InfoBox } from '../components/UI/InfoBox';
import { useData } from '../contexts/DataContext';

interface HomeProps {
  onNavigate: (tab: Tab) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { settings } = useData();

  return (
    <div className="p-5 animate-fade-in">
      {/* Hero Section */}
      <div 
        className="relative rounded-xl overflow-hidden p-8 text-center mb-6 bg-cover bg-center shadow-lg"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')` 
        }}
      >
        <h1 className="text-2xl font-bold mb-2 text-white drop-shadow-md">
          {settings.appName} <br/> <span className="text-primary text-lg">Seu Pet em Boas Mãos</span>
        </h1>
        <p className="text-gray-200 text-sm font-medium">
          {settings.address}
        </p>
      </div>

      <InfoBox icon="fa-clock" label="Horário:">
        {settings.hours}
      </InfoBox>

      <InfoBox icon="fa-stopwatch" label="Tempo estimado:">
        1 a 2 horas por pet, dependendo do serviço
      </InfoBox>

      <Card title="Serviço de Qualidade" icon="fa-star">
        <p className="text-gray-300 leading-relaxed">
          Banho, tosa, cuidados veterinários e muito mais com profissionais qualificados e amor pelos animais.
        </p>
      </Card>

      <div className="space-y-3 mt-6">
        <button 
          onClick={() => onNavigate('schedule')}
          className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <i className="fas fa-calendar-plus"></i> Agendar Serviço
        </button>
        
        <button 
          onClick={() => onNavigate('services')}
          className="w-full bg-accent hover:bg-accent-light text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <i className="fas fa-concierge-bell"></i> Ver Serviços
        </button>
      </div>
    </div>
  );
};