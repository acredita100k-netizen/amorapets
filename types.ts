
export type Tab = 'home' | 'services' | 'schedule' | 'gallery' | 'about' | 'admin';

export type ServiceCategory = 'banho' | 'veterinario' | 'produtos' | 'pacotes';

export interface ServiceItem {
  id: string;
  category: ServiceCategory;
  name: string;
  details: string;
  price: string;
}

export interface Photo {
  id: string;
  url: string;
  timestamp: number;
}

export interface AppSettings {
  appName: string;
  tagline: string;
  address: string;
  phoneDisplay: string;
  whatsappNumber: string; // Format: 5511999999999
  hours: string;
  instagramUrl: string;
  facebookUrl: string;
}

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';

export interface AppointmentData {
  serviceType: 'banho-tosa' | 'veterinario' | 'pacotes';
  service: string;
  name: string;
  phone: string;
  petName: string;
  petType: string;
  petBreed: string;
  date: string;
  time: string;
  paymentMethod: PaymentMethod;
}

// --- NOVOS TIPOS PARA O ADMIN PROFISSIONAL ---

export interface Transaction {
  id: string;
  type: 'entrada' | 'saida';
  category: string; // ex: 'Serviço', 'Venda Produto', 'Conta de Luz', 'Fornecedor'
  description: string;
  amount: number;
  date: string; // ISO Date
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  price: number; // Preço de venda
  cost: number; // Preço de custo
  unit: string; // 'un', 'kg', 'pct'
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  petName: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  isPackage: boolean; // Se é pacote mensal
  status: 'agendado' | 'concluido' | 'cancelado';
}

// Leaflet global type augmentation for window
declare global {
  interface Window {
    L: any;
  }
}
