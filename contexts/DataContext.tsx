
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { ServiceItem, Photo, AppSettings, Transaction, InventoryItem, Appointment } from '../types';

interface DataContextType {
  services: ServiceItem[];
  photos: Photo[];
  settings: AppSettings;
  transactions: Transaction[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  addService: (service: ServiceItem) => void;
  updateService: (service: ServiceItem) => void;
  removeService: (id: string) => void;
  addPhoto: (photo: Photo) => void;
  removePhoto: (id: string) => void;
  updateSettings: (newSettings: AppSettings) => void;
  
  // Financeiro
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  
  // Estoque
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (id: string) => void;
  
  // Agendamentos
  addAppointment: (appt: Appointment) => void;
  updateAppointmentStatus: (id: string, status: 'agendado' | 'concluido' | 'cancelado') => void;
  removeAppointment: (id: string) => void;

  saveSystem: () => void; 
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Alterada a chave para v8 para garantir limpeza de dados corrompidos e carregamento mobile
const STORAGE_KEY = 'amorapets_db_v8';

const INITIAL_SERVICES: ServiceItem[] = [
  { id: '1', category: 'pacotes', name: "Pacote Mensal - Pequeno (4 Banhos)", details: "1 banho por semana + Tosa Higiênica", price: "R$ 120,00" },
  { id: '2', category: 'pacotes', name: "Pacote Mensal - Médio (4 Banhos)", details: "1 banho por semana + Tosa Higiênica", price: "R$ 160,00" },
  { id: '3', category: 'banho', name: "Banho - Porte Pequeno", details: "Banho completo para pets de até 10kg", price: "R$ 35,00" },
  { id: '4', category: 'banho', name: "Banho - Porte Médio", details: "Banho completo para pets de 10kg a 20kg", price: "R$ 45,00" },
  { id: '5', category: 'banho', name: "Banho - Porte Grande", details: "Banho completo para pets acima de 20kg", price: "R$ 55,00" },
  { id: '6', category: 'veterinario', name: "Consulta Veterinária", details: "Avaliação completa de saúde", price: "R$ 80,00" },
  { id: '7', category: 'veterinario', name: "Vacinação (V8/V10)", details: "Aplicação de vacinas importadas", price: "R$ 80,00" },
];

const INITIAL_PHOTOS: Photo[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80', timestamp: Date.now() },
  { id: '2', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80', timestamp: Date.now() },
];

const INITIAL_SETTINGS: AppSettings = {
  appName: "AmoraPets",
  tagline: "Pet Shop Completo e Banho & Tosa",
  address: "Rua Francisco Albani, 853 - Conj. Res. José Bonifácio, São Paulo",
  phoneDisplay: "(11) 91417-3884",
  whatsappNumber: "5511914173884",
  hours: "Segunda a Sábado: 08:00 às 18:00",
  instagramUrl: "#",
  facebookUrl: "#"
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', type: 'entrada', category: 'Serviço', description: 'Banho Golden Retriever', amount: 55.00, date: new Date().toISOString() },
  { id: '2', type: 'saida', category: 'Fornecedor', description: 'Compra de Shampoos', amount: 150.00, date: new Date().toISOString() }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Ração Premium 1kg', quantity: 20, minQuantity: 5, price: 35.00, cost: 20.00, unit: 'pct' },
  { id: '2', name: 'Shampoo Neutro 5L', quantity: 2, minQuantity: 1, price: 0, cost: 80.00, unit: 'un' },
  { id: '3', name: 'Lacinhos (Par)', quantity: 100, minQuantity: 20, price: 5.00, cost: 0.50, unit: 'par' }
];

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  
  const loadSafe = (key: string, fallback: any) => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return fallback;
      const parsed = JSON.parse(saved);
      // Se o valor existir no objeto parseado, retorna ele, senão fallback
      return parsed[key] !== undefined ? parsed[key] : fallback;
    } catch (e) {
      console.warn("Erro ao carregar dados, usando padrão:", e);
      return fallback;
    }
  };

  const [services, setServices] = useState<ServiceItem[]>(() => loadSafe('services', INITIAL_SERVICES));
  const [photos, setPhotos] = useState<Photo[]>(() => loadSafe('photos', INITIAL_PHOTOS));
  const [settings, setSettings] = useState<AppSettings>(() => loadSafe('settings', INITIAL_SETTINGS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadSafe('transactions', INITIAL_TRANSACTIONS));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadSafe('inventory', INITIAL_INVENTORY));
  
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      const appts = parsed.appointments || [];
      // Filtro extra de segurança
      if (!Array.isArray(appts)) return [];
      return appts.filter((a: any) => a && a.id && a.clientName);
    } catch (e) {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState(false);

  const saveSystem = () => {
    try {
      const data = { services, photos, settings, transactions, inventory, appointments };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Erro ao salvar:", e);
    }
  };

  useEffect(() => {
    saveSystem();
  }, [services, photos, settings, transactions, inventory, appointments]);

  const login = (password: string) => {
    if (password === '#Ccjj9842$') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const addService = (service: ServiceItem) => setServices(prev => [...prev, service]);
  const updateService = (updatedService: ServiceItem) => setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
  const removeService = (id: string) => setServices(prev => prev.filter(s => s.id !== id));

  const addPhoto = (photo: Photo) => setPhotos(prev => [photo, ...prev]);
  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id));

  const updateSettings = (newSettings: AppSettings) => setSettings(newSettings);

  const addTransaction = (transaction: Transaction) => setTransactions(prev => [transaction, ...prev]);
  const removeTransaction = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));

  const addInventoryItem = (item: InventoryItem) => setInventory(prev => [...prev, item]);
  const updateInventoryItem = (item: InventoryItem) => setInventory(prev => prev.map(i => i.id === item.id ? item : i));
  const removeInventoryItem = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));

  const addAppointment = (appt: Appointment) => setAppointments(prev => [...prev, appt]);
  const updateAppointmentStatus = (id: string, status: 'agendado' | 'concluido' | 'cancelado') => 
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  const removeAppointment = (id: string) => setAppointments(prev => prev.filter(a => a.id !== id));

  return (
    <DataContext.Provider value={{ 
      services, photos, settings, transactions, inventory, appointments, isAdmin, 
      login, logout, 
      addService, updateService, removeService,
      addPhoto, removePhoto,
      updateSettings,
      addTransaction, removeTransaction,
      addInventoryItem, updateInventoryItem, removeInventoryItem,
      addAppointment, updateAppointmentStatus, removeAppointment,
      saveSystem
    }}>
      {children}
    </DataContext.Provider>
  );
};
