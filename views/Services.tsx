
import React from 'react';
import { Tab, ServiceItem } from '../types';
import { Card } from '../components/UI/Card';
import { InfoBox } from '../components/UI/InfoBox';
import { useData } from '../contexts/DataContext';

interface ServicesProps {
  onNavigate: (tab: Tab) => void;
}

const ServiceList: React.FC<{ items: ServiceItem[]; isAdmin: boolean; onDelete: (id: string) => void }> = ({ items, isAdmin, onDelete }) => (
  <div className="divide-y divide-zinc-700">
    {items.map((item) => (
      <div key={item.id} className="py-3 flex justify-between items-start first:pt-0 last:pb-0 group">
        <div className="flex-1">
          <div className="font-medium text-white text-lg">{item.name}</div>
          <div className="text-sm text-gray-300 mt-1 leading-snug">{item.details}</div>
        </div>
        <div className="flex flex-col items-end ml-4">
          <div className="text-primary font-bold whitespace-nowrap text-lg">{item.price}</div>
          {isAdmin && (
            <button 
              onClick={() => onDelete(item.id)}
              className="text-red-400 text-xs mt-2 hover:text-red-300 opacity-90"
            >
              <i className="fas fa-trash mr-1"></i> Excluir
            </button>
          )}
        </div>
      </div>
    ))}
    {items.length === 0 && (
      <div className="py-4 text-center text-gray-400 text-sm">Nenhum serviço disponível nesta categoria.</div>
    )}
  </div>
);

export const Services: React.FC<ServicesProps> = ({ onNavigate }) => {
  const { services, isAdmin, removeService } = useData();

  const packages = services.filter(s => s.category === 'pacotes');
  const bathServices = services.filter(s => s.category === 'banho');
  const vetServices = services.filter(s => s.category === 'veterinario');
  const products = services.filter(s => s.category === 'produtos');

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      removeService(id);
    }
  };

  return (
    <div className="p-5 animate-fade-in">
      <InfoBox icon="fa-clock" label="Horário:">
        Segunda a Sábado: 08:00 às 18:00
      </InfoBox>

      {isAdmin && (
        <div className="bg-zinc-800 p-3 rounded-lg mb-4 text-center border border-primary/50">
          <p className="text-primary font-bold text-sm">
            <i className="fas fa-user-shield mr-2"></i>
            Modo Administrador Ativo
          </p>
        </div>
      )}

      {/* PACOTES EM DESTAQUE */}
      <div className="mb-6 transform hover:scale-[1.01] transition-transform">
        <Card title="Pacotes Mensais" icon="fa-box-open" highlight className="border-l-primary bg-gradient-to-r from-primary/10 to-transparent">
            <div className="mb-3 text-sm text-primary-light font-bold bg-primary/10 p-2 rounded border border-primary/20 flex items-center">
                <i className="fas fa-star text-warning mr-2"></i> Melhor Custo Benefício!
            </div>
            <ServiceList items={packages} isAdmin={isAdmin} onDelete={handleDelete} />
        </Card>
      </div>

      <Card title="Banho & Tosa" icon="fa-bath">
        <ServiceList items={bathServices} isAdmin={isAdmin} onDelete={handleDelete} />
      </Card>

      <Card title="Veterinário" icon="fa-stethoscope">
        <ServiceList items={vetServices} isAdmin={isAdmin} onDelete={handleDelete} />
      </Card>

      <Card title="Produtos" icon="fa-shopping-bag">
        <ServiceList items={products} isAdmin={isAdmin} onDelete={handleDelete} />
      </Card>

      <button 
        onClick={() => onNavigate('schedule')}
        className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-4 text-lg"
      >
        <i className="fas fa-calendar-plus"></i> Agendar Agora
      </button>
    </div>
  );
};