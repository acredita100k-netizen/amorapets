
import React, { useState, useMemo } from 'react';
import { PaymentMethod } from '../types';
import { Card } from '../components/UI/Card';
import { useData } from '../contexts/DataContext';

const DOG_BREEDS = [
  "SRD (Vira-lata)", "Shih Tzu", "Yorkshire", "Poodle", "Lhasa Apso", 
  "Maltês", "Golden Retriever", "Bulldog Francês", "Pug", "Schnauzer", 
  "Pinscher", "Spitz Alemão (Lulu)", "Beagle", "Dachshund (Salsicha)", 
  "Labrador", "Pastor Alemão", "Rottweiler", "Border Collie", "Chow Chow", "Outra"
];

const CAT_BREEDS = [
  "SRD (Vira-lata)", "Siamês", "Persa", "Angorá", "Maine Coon", "Ragdoll", "Sphynx", "Outra"
];

export const Schedule: React.FC = () => {
  const { settings, services, addAppointment } = useData();
  
  // Filter services by category for dropdowns
  const bathOptions = services.filter(s => s.category === 'banho').map(s => s.name);
  const vetOptions = services.filter(s => s.category === 'veterinario').map(s => s.name);
  const packageOptions = services.filter(s => s.category === 'pacotes').map(s => s.name);

  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    serviceType: 'banho-tosa' as 'banho-tosa' | 'veterinario' | 'pacotes',
    service: '',
    date: '',
    time: '',
    paymentMethod: '' as PaymentMethod | ''
  });

  const [pets, setPets] = useState([
    { name: '', type: 'Cachorro', breed: '' }
  ]);

  const availableTimes = useMemo(() => {
    const times = [];
    for (let hour = 8; hour < 18; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      times.push(`${hourStr}:00`);
      times.push(`${hourStr}:30`);
    }
    return times;
  }, []);

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeChange = (type: 'banho-tosa' | 'veterinario' | 'pacotes') => {
    setContactData(prev => ({ 
      ...prev, 
      serviceType: type, 
      service: '' 
    }));
  };

  const handleTimeSelect = (time: string) => {
    setContactData(prev => ({ ...prev, time }));
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setContactData(prev => ({ ...prev, paymentMethod: method }));
  }

  const handlePetChange = (index: number, field: string, value: string) => {
    const newPets = [...pets];
    newPets[index] = { ...newPets[index], [field]: value };
    if (field === 'type') {
        newPets[index].breed = '';
    }
    setPets(newPets);
  };

  const addPet = () => {
    setPets([...pets, { name: '', type: 'Cachorro', breed: '' }]);
  };

  const removePet = (index: number) => {
    if (pets.length > 1) {
      const newPets = pets.filter((_, i) => i !== index);
      setPets(newPets);
    }
  };

  const getServiceOptions = () => {
    switch(contactData.serviceType) {
        case 'banho-tosa': return bathOptions;
        case 'veterinario': return vetOptions;
        case 'pacotes': return packageOptions;
        default: return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData.name || !contactData.phone || !contactData.service || !contactData.date || !contactData.time) {
      alert('Por favor, preencha todos os campos de contato e serviço.'); return;
    }

    if (!contactData.paymentMethod) {
        alert('Por favor, selecione uma forma de pagamento.'); return;
    }

    const invalidPets = pets.some(p => !p.name || !p.breed);
    if (invalidPets) {
        alert('Por favor, preencha o nome e a raça de todos os pets.'); return;
    }

    // --- LÓGICA DE ALERTA DE PACOTE MENSAL ---
    const isPackage = contactData.serviceType === 'pacotes';
    if (isPackage) {
      const confirmed = window.confirm(`🔔 ATENÇÃO: PACOTE MENSAL RECORRENTE\n\nOlá ${contactData.name}, ao confirmar este agendamento, você está reservando este horário para as próximas 4 SEMANAS.\n\nEste é um serviço pago semanalmente.\n\nDeseja confirmar a reserva recorrente?`);
      
      if (!confirmed) return;
    }

    // --- SALVAR NO SISTEMA ---
    pets.forEach(pet => {
      addAppointment({
        id: Date.now().toString() + Math.random(),
        clientName: contactData.name,
        clientPhone: contactData.phone,
        petName: `${pet.name} (${pet.breed})`,
        serviceName: contactData.service,
        date: contactData.date,
        time: contactData.time,
        isPackage: isPackage,
        status: 'agendado'
      });
    });

    // --- REDIRECIONAR PARA WHATSAPP ---
    let petsMessage = "";
    pets.forEach((p, i) => {
        petsMessage += `- Pet ${i + 1}: ${p.name} (${p.type} - ${p.breed})\n`;
    });

    const paymentLabel = {
        'pix': 'PIX',
        'cartao_credito': 'Cartão de Crédito',
        'cartao_debito': 'Cartão de Débito',
        'dinheiro': 'Dinheiro'
    }[contactData.paymentMethod];

    const message = `Olá! Gostaria de agendar um serviço na ${settings.appName}:
    
*Cliente:*
- Nome: ${contactData.name}
- Telefone: ${contactData.phone}

*Pets:*
${petsMessage}
*Detalhes:*
- Tipo: ${contactData.serviceType === 'pacotes' ? 'PACOTE MENSAL (Recorrente)' : contactData.serviceType === 'veterinario' ? 'Veterinário' : 'Banho & Tosa'}
- Serviço: ${contactData.service}
- Data: ${contactData.date}
- Horário: ${contactData.time}
- *Pagamento:* ${paymentLabel}

Por favor, confirme a disponibilidade.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // Reset form opcional
    window.location.href = "#home";
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="p-5 animate-fade-in pb-20">
      <Card title="Agendar Serviço" icon="fa-calendar-alt">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* DADOS DO TUTOR */}
          <div className="space-y-4 border-b border-zinc-800 pb-4">
             <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2 text-primary">Dados do Tutor</h3>
             <div>
                <input type="text" name="name" value={contactData.name} onChange={handleContactChange} placeholder="Seu Nome Completo" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none placeholder-gray-500" required />
            </div>
            <div>
                <input type="tel" name="phone" value={contactData.phone} onChange={handleContactChange} placeholder="WhatsApp (11) 99999-9999" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none placeholder-gray-500" required />
                <p className="text-[11px] text-primary mt-2 bg-primary/10 p-2 rounded border border-primary/20">
                    <i className="fab fa-whatsapp mr-1 font-bold"></i> 
                    Importante: Usaremos este número para enviar o <strong>alerta 30 minutos antes</strong> do seu horário.
                </p>
            </div>
          </div>

          {/* PETS */}
          <div className="space-y-4 border-b border-zinc-800 pb-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider text-primary">Seus Pets</h3>
            {pets.map((pet, index) => (
                <div key={index} className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 relative">
                    {index > 0 && (
                        <button type="button" onClick={() => removePet(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 p-2"><i className="fas fa-times"></i></button>
                    )}
                    <div className="space-y-3">
                        <div className="text-xs text-gray-300 font-bold mb-1">PET #{index + 1}</div>
                        <input type="text" value={pet.name} onChange={(e) => handlePetChange(index, 'name', e.target.value)} placeholder="Nome do Pet" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none placeholder-gray-500" />
                        <div className="grid grid-cols-2 gap-3">
                            <select value={pet.type} onChange={(e) => handlePetChange(index, 'type', e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none appearance-none">
                                <option value="Cachorro">Cachorro</option><option value="Gato">Gato</option>
                            </select>
                            <select value={pet.breed} onChange={(e) => handlePetChange(index, 'breed', e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none appearance-none">
                                <option value="">Raça</option>
                                {(pet.type === 'Gato' ? CAT_BREEDS : DOG_BREEDS).map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            ))}
            <button type="button" onClick={addPet} className="w-full py-3 border-2 border-dashed border-zinc-600 text-zinc-300 rounded-xl hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2 text-sm font-bold"><i className="fas fa-plus"></i> Adicionar outro Pet</button>
          </div>

          {/* SERVIÇO */}
          <div className="space-y-4 border-b border-zinc-800 pb-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2 text-primary">Tipo de Serviço</h3>
            <div className="flex border border-zinc-700 rounded-lg overflow-hidden">
                <button type="button" onClick={() => handleServiceTypeChange('banho-tosa')} className={`flex-1 py-3 text-xs font-bold uppercase ${contactData.serviceType === 'banho-tosa' ? 'bg-primary text-black' : 'bg-zinc-800 text-gray-300 hover:text-white'}`}>Banho/Tosa</button>
                <button type="button" onClick={() => handleServiceTypeChange('veterinario')} className={`flex-1 py-3 text-xs font-bold uppercase ${contactData.serviceType === 'veterinario' ? 'bg-primary text-black' : 'bg-zinc-800 text-gray-300 hover:text-white'}`}>Vet</button>
                <button type="button" onClick={() => handleServiceTypeChange('pacotes')} className={`flex-1 py-3 text-xs font-bold uppercase ${contactData.serviceType === 'pacotes' ? 'bg-warning text-black' : 'bg-zinc-800 text-gray-300 hover:text-white'}`}>Pacotes</button>
            </div>

            {/* ALERTA VISUAL DE PACOTE */}
            {contactData.serviceType === 'pacotes' && (
                <div className="bg-warning/10 border-2 border-warning rounded-lg p-4 flex flex-col gap-2 animate-pulse shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                    <div className="flex items-center gap-2 text-warning font-bold text-lg">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>SERVIÇO RECORRENTE</span>
                    </div>
                    <p className="text-white text-sm leading-relaxed">
                        Ao contratar este pacote, você confirma que <strong>toda semana</strong> seu pet terá este horário reservado. 
                        <br/><br/>
                        O pagamento garante o serviço pelas próximas <strong>4 semanas</strong>.
                    </p>
                </div>
            )}

            <select name="service" value={contactData.service} onChange={handleContactChange} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none" required>
                <option value="">Selecione o serviço específico</option>
                {getServiceOptions().map((opt, idx) => <option key={idx} value={opt}>{opt}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-gray-300 text-xs mb-1 font-medium">Data</label>
                    <input type="date" name="date" min={today} value={contactData.date} onChange={handleContactChange} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none" required />
                </div>
                <div>
                    <label className="block text-gray-300 text-xs mb-1 font-medium">Horário</label>
                    <select name="time" value={contactData.time} onChange={(e) => handleTimeSelect(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-primary outline-none" required>
                        <option value="">Horário</option>
                        {availableTimes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>
          </div>

          {/* FORMA DE PAGAMENTO */}
          <div className="space-y-3">
             <h3 className="text-white font-bold text-sm uppercase tracking-wider text-primary"><i className="fas fa-wallet mr-2"></i>Pagamento</h3>
             <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handlePaymentSelect('pix')} className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-colors ${contactData.paymentMethod === 'pix' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800'}`}>
                    <i className="fab fa-pix"></i> PIX
                </button>
                <button type="button" onClick={() => handlePaymentSelect('dinheiro')} className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-colors ${contactData.paymentMethod === 'dinheiro' ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800'}`}>
                    <i className="fas fa-money-bill-wave"></i> Dinheiro
                </button>
                <button type="button" onClick={() => handlePaymentSelect('cartao_credito')} className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-colors ${contactData.paymentMethod === 'cartao_credito' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800'}`}>
                    <i className="fas fa-credit-card"></i> Crédito
                </button>
                <button type="button" onClick={() => handlePaymentSelect('cartao_debito')} className={`p-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-colors ${contactData.paymentMethod === 'cartao_debito' ? 'bg-blue-900/30 border-blue-500 text-blue-400' : 'bg-zinc-900 border-zinc-700 text-gray-300 hover:bg-zinc-800'}`}>
                    <i className="fas fa-credit-card"></i> Débito
                </button>
             </div>
          </div>

          <button type="submit" className="w-full bg-success hover:brightness-110 text-black font-bold py-4 px-6 rounded-xl shadow-lg transform transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-6">
            <i className="fas fa-check-circle"></i> Confirmar Agendamento
          </button>
        </form>
      </Card>
    </div>
  );
};
