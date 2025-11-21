
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Card } from '../components/UI/Card';
import { ServiceCategory, AppSettings, Tab, ServiceItem, Transaction, InventoryItem, Appointment } from '../types';

interface AdminProps {
  onNavigate: (tab: Tab) => void;
}

type AdminTab = 'dashboard' | 'agenda' | 'finance' | 'inventory' | 'services' | 'settings';

export const Admin: React.FC<AdminProps> = ({ onNavigate }) => {
  const { 
    isAdmin, login, logout, 
    services, addService, updateService, removeService,
    transactions, addTransaction, removeTransaction,
    inventory, addInventoryItem, updateInventoryItem, removeInventoryItem,
    appointments, removeAppointment, updateAppointmentStatus,
    settings, updateSettings 
  } = useData();

  const [password, setPassword] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualiza o relógio a cada minuto para verificar alertas
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // --- CALCULOS DASHBOARD ---
  const totalIncome = transactions.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'saida').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;
  
  const upcomingAppointments = appointments
    .filter(a => a.status === 'agendado')
    .sort((a, b) => {
        try {
            return new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime();
        } catch (e) {
            return 0;
        }
    });
  
  // --- FORMS STATES ---
  const [transactionForm, setTransactionForm] = useState<Partial<Transaction>>({ type: 'entrada', category: '', description: '', amount: 0 });
  const [inventoryForm, setInventoryForm] = useState<Partial<InventoryItem>>({ name: '', quantity: 0, minQuantity: 5, price: 0, cost: 0, unit: 'un' });
  const [serviceForm, setServiceForm] = useState({ id: '', category: 'banho' as ServiceCategory, name: '', details: '', price: '' });
  const [settingsForm, setSettingsForm] = useState<AppSettings>(settings);
  const [isEditingService, setIsEditingService] = useState(false);
  const [isEditingInventory, setIsEditingInventory] = useState(false);

  useEffect(() => { setSettingsForm(settings); }, [settings]);

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) setPassword('');
  };

  // FINANCEIRO
  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionForm.description || !transactionForm.amount) return;
    addTransaction({
        id: Date.now().toString(),
        type: transactionForm.type as 'entrada'|'saida',
        category: transactionForm.category || 'Outros',
        description: transactionForm.description!,
        amount: Number(transactionForm.amount),
        date: new Date().toISOString()
    });
    setTransactionForm({ type: 'entrada', category: '', description: '', amount: 0 });
    alert('Lançamento registrado!');
  };

  // ESTOQUE
  const handleInventorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryForm.name) return;
    
    const item: InventoryItem = {
        id: isEditingInventory ? inventoryForm.id! : Date.now().toString(),
        name: inventoryForm.name!,
        quantity: Number(inventoryForm.quantity),
        minQuantity: Number(inventoryForm.minQuantity),
        price: Number(inventoryForm.price),
        cost: Number(inventoryForm.cost),
        unit: inventoryForm.unit || 'un'
    };

    if (isEditingInventory) {
        updateInventoryItem(item);
        setIsEditingInventory(false);
    } else {
        addInventoryItem(item);
    }
    setInventoryForm({ name: '', quantity: 0, minQuantity: 5, price: 0, cost: 0, unit: 'un' });
  };

  const handleEditInventory = (item: InventoryItem) => {
      setInventoryForm(item);
      setIsEditingInventory(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // SERVIÇOS
  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) return;
    if (isEditingService && serviceForm.id) {
      updateService({ ...serviceForm });
      setIsEditingService(false);
    } else {
      addService({ ...serviceForm, id: Date.now().toString() });
    }
    setServiceForm({ id: '', category: 'banho', name: '', details: '', price: '' });
  };

  const handleEditService = (service: ServiceItem) => {
    setServiceForm(service);
    setIsEditingService(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // WHATSAPP REMINDER
  const sendWhatsappReminder = (appt: Appointment) => {
    const text = `🔔 *LEMBRETE AMORAPETS* 🔔\n\nOlá ${appt.clientName}!\n\nPassando para lembrar que o horário do seu pet *${appt.petName}* começa em breve: *${appt.time}*.\n\nServiço: ${appt.serviceName}\n\nEstamos te esperando! 🐾`;
    
    // Remove caracteres não numéricos do telefone
    const phone = appt.clientPhone.replace(/\D/g, '');
    // Adiciona 55 se não tiver
    const fullPhone = phone.length <= 11 ? `55${phone}` : phone;
    
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Verifica se o agendamento é "agora" (dentro de 40 minutos antes do horário)
  const isUrgent = (appt: Appointment) => {
    try {
        const apptDate = new Date(`${appt.date}T${appt.time}`);
        const diffMs = apptDate.getTime() - currentTime.getTime();
        const diffMins = diffMs / (1000 * 60);
        // Se faltar entre 0 e 40 minutos, é urgente para mandar o alerta de 30min
        return diffMins > 0 && diffMins <= 40;
    } catch (e) {
        return false;
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-5 animate-fade-in h-full flex flex-col justify-center">
        <Card title="Sistema de Gestão" icon="fa-lock">
          <p className="text-sm text-gray-300 mb-4">Área restrita para gerência.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-primary font-medium mb-2">Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none" /></div>
            <button type="submit" className="w-full bg-primary hover:bg-primary-light text-black font-bold py-3 rounded-lg shadow-lg">Entrar</button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-900">
      {/* Header Admin */}
      <div className="bg-black border-b border-zinc-800 p-4 flex justify-between items-center sticky top-0 z-30 shadow-lg">
        <div>
            <h2 className="text-white font-bold font-serif tracking-wide">AmoraPets <span className="text-primary text-xs uppercase bg-primary/20 px-2 py-1 rounded ml-2">ERP</span></h2>
        </div>
        <button onClick={() => {logout(); onNavigate('home')}} className="text-red-500 text-xs font-bold border border-red-500/50 px-3 py-1 rounded hover:bg-red-500/10">SAIR</button>
      </div>

      {/* Sub-Navigation */}
      <div className="bg-zinc-900 border-b border-zinc-800 overflow-x-auto flex no-scrollbar">
        <button onClick={() => setActiveAdminTab('dashboard')} className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap ${activeAdminTab === 'dashboard' ? 'text-primary border-b-2 border-primary bg-zinc-800' : 'text-gray-400 hover:text-gray-200'}`}>Dashboard</button>
        <button onClick={() => setActiveAdminTab('agenda')} className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap ${activeAdminTab === 'agenda' ? 'text-primary border-b-2 border-primary bg-zinc-800' : 'text-gray-400 hover:text-gray-200'}`}>Agenda</button>
        <button onClick={() => setActiveAdminTab('finance')} className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap ${activeAdminTab === 'finance' ? 'text-primary border-b-2 border-primary bg-zinc-800' : 'text-gray-400 hover:text-gray-200'}`}>Financeiro</button>
        <button onClick={() => setActiveAdminTab('inventory')} className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap ${activeAdminTab === 'inventory' ? 'text-primary border-b-2 border-primary bg-zinc-800' : 'text-gray-400 hover:text-gray-200'}`}>Estoque</button>
        <button onClick={() => setActiveAdminTab('services')} className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap ${activeAdminTab === 'services' ? 'text-primary border-b-2 border-primary bg-zinc-800' : 'text-gray-400 hover:text-gray-200'}`}>Serviços</button>
        <button onClick={() => setActiveAdminTab('settings')} className={`flex-1 py-3 px-4 text-sm font-bold whitespace-nowrap ${activeAdminTab === 'settings' ? 'text-primary border-b-2 border-primary bg-zinc-800' : 'text-gray-400 hover:text-gray-200'}`}>Config</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 bg-black">
        
        {/* --- DASHBOARD --- */}
        {activeAdminTab === 'dashboard' && (
            <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-800 p-4 rounded-xl border-l-4 border-green-500 shadow-lg">
                        <div className="text-gray-300 text-xs uppercase font-bold">Entradas (Mês)</div>
                        <div className="text-green-400 text-xl font-bold mt-1">R$ {totalIncome.toFixed(2)}</div>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-xl border-l-4 border-red-500 shadow-lg">
                        <div className="text-gray-300 text-xs uppercase font-bold">Saídas (Mês)</div>
                        <div className="text-red-400 text-xl font-bold mt-1">R$ {totalExpense.toFixed(2)}</div>
                    </div>
                </div>
                <div className="bg-zinc-800 p-6 rounded-xl shadow-lg text-center border border-zinc-700">
                    <div className="text-gray-300 text-xs uppercase font-bold mb-2">Saldo Atual</div>
                    <div className={`text-4xl font-bold ${balance >= 0 ? 'text-primary' : 'text-red-500'}`}>R$ {balance.toFixed(2)}</div>
                </div>
                
                <h3 className="text-white font-bold mt-6 mb-2 border-b border-zinc-800 pb-2">Próximos Agendamentos</h3>
                {upcomingAppointments.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">Nenhum agendamento próximo.</div>
                ) : (
                    <div className="space-y-2">
                        {upcomingAppointments.slice(0, 3).map(a => (
                             <div key={a.id} className="bg-zinc-800 border-l-4 border-primary p-3 rounded flex justify-between items-center">
                                <div>
                                    <div className="text-white font-bold text-sm">{a.petName} <span className="text-xs font-normal text-gray-400">- {a.clientName}</span></div>
                                    <div className="text-primary text-xs">{new Date(a.date).toLocaleDateString('pt-BR')} às {a.time}</div>
                                </div>
                                <span className="text-xs bg-zinc-700 px-2 py-1 rounded text-gray-300">{a.serviceName}</span>
                             </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- AGENDA --- */}
        {activeAdminTab === 'agenda' && (
            <div className="space-y-6 animate-fade-in">
                <Card title="Agenda" icon="fa-calendar-check">
                    <div className="mb-4 text-xs text-gray-400 bg-zinc-900 p-2 rounded border border-zinc-800">
                        <i className="fas fa-info-circle mr-1"></i> Agendamentos marcados em <span className="text-red-400 font-bold">VERMELHO</span> estão próximos do horário. Envie o alerta!
                    </div>

                    {upcomingAppointments.length === 0 ? (
                         <div className="text-center py-6 text-gray-500">
                             <i className="far fa-calendar-times text-3xl mb-2"></i>
                             <p>Nenhum agendamento pendente.</p>
                         </div>
                    ) : (
                        <div className="space-y-4">
                            {upcomingAppointments.map(a => {
                                const urgent = isUrgent(a);
                                return (
                                <div key={a.id} className={`bg-zinc-900 rounded-xl p-4 border-l-4 relative shadow-md transition-all ${urgent ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : (a.isPackage ? 'border-warning' : 'border-primary')}`}>
                                    
                                    {/* Badge Urgente */}
                                    {urgent && (
                                        <div className="absolute -top-2 -left-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-pulse z-10">
                                            <i className="fas fa-bell mr-1"></i> É DAQUI A POUCO!
                                        </div>
                                    )}

                                    {/* Badge Pacote */}
                                    {a.isPackage && (
                                        <div className="absolute top-0 right-0 bg-warning text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg shadow">
                                            <i className="fas fa-sync-alt mr-1"></i> PACOTE
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-start mb-3 mt-2">
                                        <div>
                                            <div className="text-3xl font-bold text-white">{a.time}</div>
                                            <div className="text-sm text-gray-400 uppercase">{new Date(a.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                                        </div>
                                        <div className="text-right mt-2">
                                             <button onClick={() => updateAppointmentStatus(a.id, 'concluido')} className="text-green-500 hover:text-green-400 mr-4 transform hover:scale-110 transition-transform" title="Concluir"><i className="fas fa-check-circle text-2xl"></i></button>
                                             <button onClick={() => removeAppointment(a.id)} className="text-red-500 hover:text-red-400 transform hover:scale-110 transition-transform" title="Cancelar"><i className="fas fa-times-circle text-2xl"></i></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                                        <div className="bg-black/40 p-2 rounded border border-zinc-800">
                                            <div className="text-gray-500 text-xs">Pet</div>
                                            <div className="text-white font-bold">{a.petName}</div>
                                        </div>
                                        <div className="bg-black/40 p-2 rounded border border-zinc-800">
                                            <div className="text-gray-500 text-xs">Tutor</div>
                                            <div className="text-white font-bold truncate">{a.clientName}</div>
                                            <div className="text-xs text-gray-500">{a.clientPhone}</div>
                                        </div>
                                        <div className="col-span-2 bg-black/40 p-2 rounded border border-zinc-800">
                                            <div className="text-gray-500 text-xs">Serviço</div>
                                            <div className="text-primary-light">{a.serviceName}</div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => sendWhatsappReminder(a)}
                                        className={`w-full font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-colors shadow-lg ${urgent ? 'bg-red-600 hover:bg-red-500 text-white animate-bounce-slight' : 'bg-green-600 hover:bg-green-500 text-white'}`}
                                    >
                                        <i className="fab fa-whatsapp text-xl"></i> 
                                        {urgent ? "ENVIAR ALERTA 30 MIN AGORA" : "Enviar Lembrete WhatsApp"}
                                    </button>
                                </div>
                            )})}
                        </div>
                    )}
                </Card>
            </div>
        )}

        {/* --- FINANCEIRO --- */}
        {activeAdminTab === 'finance' && (
            <div className="space-y-6 animate-fade-in">
                <Card title="Novo Lançamento" icon="fa-cash-register">
                    <form onSubmit={handleTransactionSubmit} className="space-y-3">
                        <div className="flex bg-zinc-900 rounded p-1 border border-zinc-700">
                            <button type="button" onClick={() => setTransactionForm(p => ({...p, type: 'entrada'}))} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${transactionForm.type === 'entrada' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}>Entrada</button>
                            <button type="button" onClick={() => setTransactionForm(p => ({...p, type: 'saida'}))} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${transactionForm.type === 'saida' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}>Saída</button>
                        </div>
                        <input type="text" value={transactionForm.description} onChange={e => setTransactionForm(p => ({...p, description: e.target.value}))} placeholder="Descrição (ex: Banho Thor)" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" required />
                        <div className="flex gap-2">
                            <input type="text" value={transactionForm.category} onChange={e => setTransactionForm(p => ({...p, category: e.target.value}))} placeholder="Categoria" className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" />
                            <input type="number" step="0.01" value={transactionForm.amount || ''} onChange={e => setTransactionForm(p => ({...p, amount: parseFloat(e.target.value)}))} placeholder="Valor (R$)" className="w-32 bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" required />
                        </div>
                        <button type="submit" className="w-full bg-primary text-black font-bold py-2 rounded hover:brightness-110">Registrar</button>
                    </form>
                </Card>
                <div className="space-y-2">
                    <h3 className="text-white font-bold text-sm">Últimos Lançamentos</h3>
                    {transactions.slice(0, 20).map(t => (
                        <div key={t.id} className="flex justify-between items-center bg-zinc-900 p-3 rounded border border-zinc-800">
                            <div>
                                <div className="text-white font-bold text-sm">{t.description}</div>
                                <div className="text-gray-400 text-xs">{new Date(t.date).toLocaleDateString()} - {t.category}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold ${t.type === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                                    {t.type === 'entrada' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                </span>
                                <button onClick={() => removeTransaction(t.id)} className="text-gray-600 hover:text-red-500"><i className="fas fa-trash-alt text-xs"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- ESTOQUE --- */}
        {activeAdminTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
                <Card title={isEditingInventory ? "Editar Produto" : "Cadastrar Produto"} icon="fa-boxes" highlight={isEditingInventory}>
                    <form onSubmit={handleInventorySubmit} className="space-y-3">
                        <input type="text" value={inventoryForm.name} onChange={e => setInventoryForm(p => ({...p, name: e.target.value}))} placeholder="Nome do Produto" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" required />
                        <div className="grid grid-cols-3 gap-2">
                             <input type="number" value={inventoryForm.quantity || ''} onChange={e => setInventoryForm(p => ({...p, quantity: Number(e.target.value)}))} placeholder="Qtd" className="bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" />
                             <input type="number" value={inventoryForm.minQuantity || ''} onChange={e => setInventoryForm(p => ({...p, minQuantity: Number(e.target.value)}))} placeholder="Min" className="bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" />
                             <select value={inventoryForm.unit} onChange={e => setInventoryForm(p => ({...p, unit: e.target.value}))} className="bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none">
                                 <option value="un">UN</option><option value="kg">KG</option><option value="litro">L</option><option value="pct">PCT</option><option value="par">PAR</option>
                             </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                             <input type="number" step="0.01" value={inventoryForm.cost || ''} onChange={e => setInventoryForm(p => ({...p, cost: Number(e.target.value)}))} placeholder="Custo Unit. (R$)" className="bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" />
                             <input type="number" step="0.01" value={inventoryForm.price || ''} onChange={e => setInventoryForm(p => ({...p, price: Number(e.target.value)}))} placeholder="Venda Unit. (R$)" className="bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className={`flex-1 text-black font-bold py-2 rounded hover:brightness-110 ${isEditingInventory ? 'bg-warning' : 'bg-primary'}`}>{isEditingInventory ? 'Atualizar' : 'Adicionar'}</button>
                            {isEditingInventory && (
                                <button type="button" onClick={() => {setIsEditingInventory(false); setInventoryForm({ name: '', quantity: 0, minQuantity: 5, price: 0, cost: 0, unit: 'un' })}} className="px-4 bg-zinc-700 text-white font-bold rounded hover:bg-zinc-600">Cancelar</button>
                            )}
                        </div>
                    </form>
                </Card>
                
                <div className="space-y-2">
                    {inventory.map(item => (
                        <div key={item.id} className="bg-zinc-900 p-3 rounded border border-zinc-800 flex justify-between items-center">
                            <div>
                                <div className="text-white font-bold text-sm">{item.name}</div>
                                <div className="text-gray-400 text-xs">Qtd: {item.quantity} {item.unit} | Min: {item.minQuantity}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleEditInventory(item)} className="text-blue-400 hover:text-blue-300"><i className="fas fa-edit"></i></button>
                                <button onClick={() => removeInventoryItem(item.id)} className="text-red-500 hover:text-red-400"><i className="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- SERVIÇOS --- */}
        {activeAdminTab === 'services' && (
            <div className="space-y-6 animate-fade-in">
                <Card title={isEditingService ? "Editar Serviço" : "Adicionar Serviço"} icon="fa-concierge-bell" highlight={isEditingService}>
                    <form onSubmit={handleServiceSubmit} className="space-y-3">
                        <select value={serviceForm.category} onChange={e => setServiceForm(p => ({...p, category: e.target.value as ServiceCategory}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none">
                            <option value="banho">Banho & Tosa</option>
                            <option value="veterinario">Veterinário</option>
                            <option value="pacotes">Pacotes</option>
                            <option value="produtos">Produtos</option>
                        </select>
                        <input type="text" value={serviceForm.name} onChange={e => setServiceForm(p => ({...p, name: e.target.value}))} placeholder="Nome do Serviço" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" required />
                        <textarea value={serviceForm.details} onChange={e => setServiceForm(p => ({...p, details: e.target.value}))} placeholder="Detalhes" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500 h-20" />
                        <input type="text" value={serviceForm.price} onChange={e => setServiceForm(p => ({...p, price: e.target.value}))} placeholder="Preço (ex: R$ 50,00)" className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none placeholder-gray-500" required />
                        
                        <div className="flex gap-2">
                            <button type="submit" className={`flex-1 text-black font-bold py-2 rounded hover:brightness-110 ${isEditingService ? 'bg-warning' : 'bg-primary'}`}>{isEditingService ? 'Atualizar' : 'Adicionar'}</button>
                            {isEditingService && (
                                <button type="button" onClick={() => {setIsEditingService(false); setServiceForm({ id: '', category: 'banho', name: '', details: '', price: '' })}} className="px-4 bg-zinc-700 text-white font-bold rounded hover:bg-zinc-600">Cancelar</button>
                            )}
                        </div>
                    </form>
                </Card>

                <div className="space-y-2">
                    {services.map(item => (
                        <div key={item.id} className="bg-zinc-900 p-3 rounded border border-zinc-800 flex justify-between items-start">
                            <div>
                                <span className="text-xs font-bold uppercase bg-zinc-800 px-2 py-1 rounded text-gray-400 mb-1 inline-block">{item.category}</span>
                                <div className="text-white font-bold text-sm">{item.name}</div>
                                <div className="text-gray-400 text-xs">{item.price}</div>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <button onClick={() => handleEditService(item)} className="text-blue-400 hover:text-blue-300"><i className="fas fa-edit"></i></button>
                                <button onClick={() => removeService(item.id)} className="text-red-500 hover:text-red-400"><i className="fas fa-trash-alt"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- SETTINGS --- */}
        {activeAdminTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
                 <Card title="Configurações" icon="fa-cogs">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Nome do App</label>
                            <input type="text" value={settingsForm.appName} onChange={e => setSettingsForm(p => ({...p, appName: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Slogan</label>
                            <input type="text" value={settingsForm.tagline} onChange={e => setSettingsForm(p => ({...p, tagline: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Endereço</label>
                            <input type="text" value={settingsForm.address} onChange={e => setSettingsForm(p => ({...p, address: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Telefone (Display)</label>
                            <input type="text" value={settingsForm.phoneDisplay} onChange={e => setSettingsForm(p => ({...p, phoneDisplay: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-xs mb-1">Whatsapp (Link - Apenas números)</label>
                            <input type="text" value={settingsForm.whatsappNumber} onChange={e => setSettingsForm(p => ({...p, whatsappNumber: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>
                         <div>
                            <label className="block text-gray-400 text-xs mb-1">Horário</label>
                            <input type="text" value={settingsForm.hours} onChange={e => setSettingsForm(p => ({...p, hours: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>
                         <div>
                            <label className="block text-gray-400 text-xs mb-1">Instagram</label>
                            <input type="text" value={settingsForm.instagramUrl} onChange={e => setSettingsForm(p => ({...p, instagramUrl: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>
                         <div>
                            <label className="block text-gray-400 text-xs mb-1">Facebook</label>
                            <input type="text" value={settingsForm.facebookUrl} onChange={e => setSettingsForm(p => ({...p, facebookUrl: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-white text-sm focus:border-primary outline-none" />
                        </div>

                        <button onClick={() => {updateSettings(settingsForm); alert('Configurações salvas!')}} className="w-full bg-primary text-black font-bold py-3 rounded hover:brightness-110 mt-2">Salvar Configurações</button>
                    </div>
                 </Card>
            </div>
        )}

      </div>
    </div>
  );
};
