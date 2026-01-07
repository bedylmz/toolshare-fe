// src/pages/UserProfile.tsx
import React from 'react';
import { Star, ShieldCheck, Clock, User as UserIcon, Wrench, Calendar, LogOut } from 'lucide-react';
import { ProfileMenuItem } from '../components/UI';
import { User, Tool, Reservation } from '../services/api';

// Props için arayüz tanımlıyoruz
interface UserProfileProps {
  user: User | null;
  userTools: Tool[];
  userReservations: Reservation[];
  loading?: boolean;
  onLogout?: () => void;
}

export default function UserProfile({ user, userTools, userReservations, loading = false, onLogout }: UserProfileProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p>Profil yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl shadow-sm p-8">
        <UserIcon className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-gray-600">Kullanıcı bulunamadı</h3>
        <p className="text-sm text-center mt-2">Lütfen giriş yapın.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Profil Kartı */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl border-2 border-white/30 backdrop-blur-sm font-bold">
            {user.user_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{user.user_name}</h2>
            <p className="text-blue-100 text-sm">
              Üyelik: {new Date(user.created_at).toLocaleDateString('tr-TR')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <div className="text-center border-r border-white/10">
            <div className="text-3xl font-bold flex items-center justify-center gap-1">
              {user.avg_scr.toFixed(1)} 
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>
            <div className="text-xs text-blue-200 mt-1">Güvenlik Skoru</div>
          </div>
          <div className="text-center border-r border-white/10">
            <div className="text-3xl font-bold">{userTools.length}</div>
            <div className="text-xs text-blue-200 mt-1">Paylaşılan Alet</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">{user.rev_cnt}</div>
            <div className="text-xs text-blue-200 mt-1">Değerlendirme</div>
          </div>
        </div>
      </div>

      {/* Kullanıcı Aletleri */}
      {userTools.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            Paylaştığım Aletler
          </h3>
          <div className="space-y-2">
            {userTools.slice(0, 5).map(tool => (
              <div 
                key={tool.tool_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-700">{tool.tool_name}</span>
                </div>
                <span className="text-xs text-gray-400">
                  #{tool.tool_id}
                </span>
              </div>
            ))}
            {userTools.length > 5 && (
              <p className="text-center text-sm text-gray-400 pt-2">
                +{userTools.length - 5} alet daha
              </p>
            )}
          </div>
        </div>
      )}

      {/* Son Rezervasyonlar */}
      {userReservations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Son Kiralamalarım
          </h3>
          <div className="space-y-2">
            {userReservations.slice(0, 3).map(reservation => (
              <div 
                key={reservation.reservation_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 block">
                      Rezervasyon #{reservation.reservation_id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(reservation.start_t).toLocaleDateString('tr-TR')} tarihinde başlayacak{' '}
                      {new Date(reservation.end_t).toLocaleDateString('tr-TR')} tarihinde bitiyor
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          icon={<UserIcon className="text-purple-500" />} 
          label="Hesap Ayarları" 
        />
      </div>

      {/* Çıkış Butonu */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-2xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      )}
    </div>
  );
}
