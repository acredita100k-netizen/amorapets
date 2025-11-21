import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { Footer } from './components/Layout/Footer';
import { WhatsAppFloat } from './components/UI/WhatsAppFloat';
import { Home } from './views/Home';
import { Services } from './views/Services';
import { Schedule } from './views/Schedule';
import { Gallery } from './views/Gallery';
import { About } from './views/About';
import { Admin } from './views/Admin';
import { Tab } from './types';
import { DataProvider } from './contexts/DataContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'services':
        return <Services onNavigate={setActiveTab} />;
      case 'schedule':
        return <Schedule />;
      case 'gallery':
        return <Gallery />;
      case 'about':
        return <About />;
      case 'admin':
        return <Admin onNavigate={setActiveTab} />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <DataProvider>
      <div className="min-h-screen bg-black text-white font-sans flex flex-col items-center">
        <div className="w-full max-w-[480px] min-h-screen bg-dark-grey shadow-[0_0_30px_rgba(76,175,80,0.3)] relative flex flex-col">
          <Header onNavigate={setActiveTab} />
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </main>

          <Footer />
          <WhatsAppFloat />
        </div>
      </div>
    </DataProvider>
  );
}