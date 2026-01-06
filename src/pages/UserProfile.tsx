// src/pages/UserProfile.tsx
import React from 'react';
import { Star, ShieldCheck, Clock, User } from 'lucide-react';
import { ProfileMenuItem } from '../components/UI';

// Props için arayüz tanımlıyoruz
interface UserProfileProps {
  toolsCount: number;
}

export default function UserProfile({ toolsCount }: UserProfileProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profil Kartı */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          {/* Avatar kısmı: İleride görsel gelirse buraya string veya Image tipi eklenebilir */}
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl border-2 border-white/30 backdrop-blur-sm">
            👤
          </div>
          <div>
            <h2 className="text-2xl font-bold">Orçun Aydın</h2>
            <p className="text-blue-100">Bakırköy, İstanbul</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="text-center border-r border-white/10">
            <div className="text-3xl font-bold flex items-center justify-center gap-1">
              4.9 <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-xs text-blue-200 mt-1">Güvenlik Skoru</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{toolsCount}</div>
            <div className="text-xs text-blue-200 mt-1">Paylaşılan Alet</div>
          </div>
        </div>
      </div>

      {/* Menü Listesi */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <ProfileMenuItem 
          icon={<ShieldCheck className="text-green-500" />} 
          label="Kimlik Doğrulama" 
          status="Doğrulandı" 
        />
        <ProfileMenuItem 
          icon={<Star className="text-yellow-500" />} 
          label="Değerlendirmelerim" 
        />
        <ProfileMenuItem 
          icon={<Clock className="text-blue-500" />} 
          label="Geçmiş Kiralamalar" 
        />
        <ProfileMenuItem 
          icon={<User className="text-purple-500" />} 
          label="Hesap Ayarları" 
        />
      </div>
    </div>
  );
}