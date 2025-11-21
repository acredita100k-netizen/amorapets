
import React, { useRef, useState } from 'react';
import { useData } from '../contexts/DataContext';

export const Gallery: React.FC = () => {
  const { photos, isAdmin, addPhoto, removePhoto, saveSystem } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          addPhoto({
            id: Date.now().toString(),
            url: event.target.result as string,
            timestamp: Date.now()
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    // Crucial: prevent the click from reaching elements below or the container
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Excluir esta foto permanentemente?')) {
      removePhoto(id);
    }
  };

  const handleSaveGallery = () => {
    setSaving(true);
    // Perform actual save
    saveSystem();
    
    // Visual feedback
    setTimeout(() => {
      setSaving(false);
      alert('Fotos salvas com sucesso!');
    }, 800);
  };

  return (
    <div className="p-5 animate-fade-in">
      <div className="flex flex-col mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Galeria</h2>
            <p className="text-gray-400 text-sm">Momentos fofos dos clientes</p>
          </div>
        </div>
        
        {/* Admin Toolbar */}
        {isAdmin && (
          <div className="bg-zinc-800 p-4 rounded-xl border border-zinc-700 mb-4 shadow-lg">
             <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-sm border-b-2 border-primary pb-1">Gerenciar Fotos</span>
                <button 
                  onClick={handleSaveGallery}
                  disabled={saving}
                  className={`${saving ? 'bg-green-800' : 'bg-green-600 hover:bg-green-700'} text-white text-sm px-4 py-2 rounded-lg shadow-md transition-colors flex items-center gap-2 font-bold`}
                >
                  <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i> {saving ? 'SALVANDO...' : 'SALVAR'}
                </button>
             </div>
             
             <div className="flex gap-3">
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 bg-primary hover:bg-primary-light text-white py-3 rounded-lg shadow-md flex items-center justify-center transition-all active:scale-95"
                  title="Usar Câmera"
                >
                  <i className="fas fa-camera mr-2"></i> Câmera
                </button>

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-accent hover:bg-accent-light text-white py-3 rounded-lg shadow-md flex items-center justify-center transition-all active:scale-95"
                  title="Carregar da Galeria"
                >
                  <i className="fas fa-upload mr-2"></i> Upload
                </button>
             </div>

            <input 
              type="file" 
              ref={cameraInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              capture="environment"
              className="hidden"
            />
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*" 
              className="hidden"
            />
          </div>
        )}
      </div>
      
      {isAdmin && photos.length > 0 && (
        <div className="mb-4 p-2 bg-red-900/20 border border-red-900/50 rounded text-xs text-center text-red-200 animate-pulse">
          <i className="fas fa-info-circle mr-1"></i> Clique no ícone de lixeira para remover fotos.
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {photos.map(photo => (
          <div key={photo.id} className="relative aspect-square overflow-hidden rounded-xl border border-zinc-700 shadow-md bg-zinc-900 group">
            <img 
              src={photo.url} 
              alt="Pet" 
              className="w-full h-full object-cover" 
            />
            
            {isAdmin ? (
               <button 
                onClick={(e) => handleDelete(e, photo.id)}
                className="absolute top-2 right-2 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg z-50 cursor-pointer transition-transform active:scale-90 border-2 border-white/20"
                aria-label="Excluir foto"
                title="Excluir foto"
                type="button"
               >
                 <i className="fas fa-trash-alt text-sm"></i>
               </button>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                <i className="fas fa-heart text-primary text-lg drop-shadow-md"></i>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {photos.length === 0 && (
        <div className="text-center py-10 text-gray-500 bg-zinc-900/50 rounded-xl border-dashed border-2 border-zinc-800">
          <i className="fas fa-images text-4xl mb-3 opacity-50"></i>
          <p>Nenhuma foto na galeria.</p>
        </div>
      )}
    </div>
  );
};
