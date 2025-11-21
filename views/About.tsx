import React, { useEffect, useRef } from 'react';
import { InfoBox } from '../components/UI/InfoBox';

export const About: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Initialize map only if it hasn't been initialized and ref exists
    if (mapRef.current && !mapInstanceRef.current && window.L) {
      const L = window.L;
      // Coords for: Rua Giovanni Segantini, 257 - São Paulo (Approx)
      const lat = -23.5418;
      const lng = -46.4364; 

      const map = L.map(mapRef.current).setView([lat, lng], 15);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      L.marker([lat, lng]).addTo(map)
        .bindPopup('AmoraPets')
        .openPopup();

      mapInstanceRef.current = map;
    }

    // Cleanup function to remove map on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-5 animate-fade-in">
      <InfoBox icon="fa-info-circle" label="Sobre Nós">
        A AmoraPets é dedicada ao bem-estar e saúde dos animais há mais de 5 anos. Oferecemos serviços de banho, tosa, cuidados veterinários e uma variedade de produtos de alta qualidade para seu pet.
      </InfoBox>

      <div className="w-full h-[300px] rounded-xl overflow-hidden mb-6 border-2 border-zinc-700 relative z-0">
        <div ref={mapRef} className="w-full h-full bg-zinc-800 flex items-center justify-center">
             {!window.L && <span className="text-gray-400">Carregando mapa...</span>}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-primary text-xl font-bold mb-2 border-l-4 border-accent pl-3">Avaliações</h3>
        
        <ReviewItem 
          name="Mariana Silva" 
          rating={5} 
          text="Serviço excelente! Minha cachorrinha sempre volta linda e cheirosa. A equipe é muito atenciosa!" 
        />
        <ReviewItem 
          name="Roberto Oliveira" 
          rating={4.5} 
          text="Levo meu gato há mais de 2 anos e sempre fico satisfeito. Profissionais qualificados e preços justos." 
        />
        <ReviewItem 
          name="Carla Santos" 
          rating={5} 
          text="Meu cachorro adora ir na AmoraPets! Além dos serviços excelentes, eles têm ótimos produtos. Recomendo!" 
        />
      </div>
    </div>
  );
};

const ReviewItem: React.FC<{ name: string; rating: number; text: string }> = ({ name, rating, text }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  return (
    <div className="bg-dark-grey p-4 rounded-lg shadow-sm border border-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-primary">{name}</span>
        <div className="text-accent text-sm">
          {[...Array(fullStars)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
          {hasHalfStar && <i className="fas fa-star-half-alt"></i>}
        </div>
      </div>
      <p className="text-gray-200 text-sm italic">"{text}"</p>
    </div>
  );
};