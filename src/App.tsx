// src/App.tsx
import React, { useState } from 'react';
import { Home, Calendar, User as UserIcon, MapPin, PlusCircle, CheckCircle } from 'lucide-react';

// Bileşenleri İçe Aktarma
import { Header, NavButton } from './components/UI';
import Marketplace, { Tool } from './pages/Marketplace';
import AddToolForm from './pages/AddToolForm';
import Reservations, { Reservation } from './pages/Reservations';
import UserProfile from './pages/UserProfile';

// Veriyi İçe Aktarma
import { INITIAL_TOOLS } from './data';

// Sekme isimleri için bir tip tanımlıyoruz
type Tab = 'home' | 'reservations' | 'add' | 'profile';

// Bildirim yapısı için bir interfacen
interface Notification {
  message: string;
  type: 'success' | 'info' | 'error';
}

export default function App() {
  // State tanımlamaları (Generic tiplerle birlikte)
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [tools, setTools] = useState<Tool[]>(INITIAL_TOOLS);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [showNotification, setShowNotification] = useState<Notification | null>(null);
  const [myReservations, setMyReservations] = useState<Reservation[]>([]);

  // Bildirim Fonksiyonu
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 3000);
  };

  // İşlem Fonksiyonları
  const handleAddTool = (newTool: Tool) => {
    setTools([newTool, ...tools]);
    triggerNotification('Alet başarıyla vitrine eklendi!');
    setActiveTab('home');
  };

  const handleReserve = (tool: Tool) => {
    const reservation: Reservation = {
      id: Date.now(),
      tool: tool,
      date: new Date().toLocaleDateString('tr-TR'),
      status: 'Onay Bekliyor'
    };
    setMyReservations([reservation, ...myReservations]);
    triggerNotification(`${tool.title} için talep gönderildi!`);
  };

  // İçerik Yönlendirme
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Marketplace 
            tools={tools} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onReserve={handleReserve}
          />
        );
      case 'add':
        return <AddToolForm onAdd={handleAddTool} onCancel={() => setActiveTab('home')} />;
      case 'reservations':
        return <Reservations reservations={myReservations} />;
      case 'profile':
        return <UserProfile toolsCount={tools.length} />;
      default:
        return <Marketplace tools={tools} searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} onReserve={handleReserve} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans text-gray-800">
      <Header activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as Tab)} />

      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Bildirim Toast */}
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span>{showNotification.message}</span>
        </div>
      )}

      {/* Alt Navigasyon - Mobil'de görünür, masaüstünde gizli */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 lg:hidden">
        <div className="max-w-5xl mx-auto flex justify-around py-3">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home size={24} />} 
            label="Vitrin" 
          />
          <NavButton 
            active={activeTab === 'reservations'} 
            onClick={() => setActiveTab('reservations')} 
            icon={<Calendar size={24} />} 
            label="Kiraladıklarım" 
          />
          <div className="relative -top-6">
            <button 
              onClick={() => setActiveTab('add')}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 active:scale-95"
            >
              <PlusCircle size={28} />
            </button>
          </div>
          <NavButton 
            active={false} 
            onClick={() => triggerNotification('Mesajlaşma özelliği yakında!', 'info')} 
            icon={<MapPin size={24} />} 
            label="Harita" 
          />
          <NavButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')} 
            icon={<UserIcon size={24} />} 
            label="Profil" 
          />
        </div>
      </nav>
    </div>
  );
}