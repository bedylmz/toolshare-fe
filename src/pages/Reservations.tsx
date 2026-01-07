// src/pages/Reservations.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, Wrench, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Reservation, Tool, toolApi } from '../services/api';

// Props arayüzü
interface ReservationsProps {
  reservations: Reservation[];
  loading?: boolean;
}

// Tool cache'i için tip
type ToolCache = Record<number, Tool>;

export default function Reservations({ reservations, loading = false }: ReservationsProps) {
  const [tools, setTools] = useState<ToolCache>({});

  // Rezervasyonlardaki tool bilgilerini yükle
  useEffect(() => {
    const loadTools = async () => {
      const uniqueToolIds = [...new Set(reservations.map(r => r.tool_id))];
      const newTools: ToolCache = {};
      
      await Promise.all(
        uniqueToolIds.map(async (toolId) => {
          if (!tools[toolId]) {
            try {
              const tool = await toolApi.getById(toolId);
              newTools[toolId] = tool;
            } catch (err) {
              console.error(`Tool ${toolId} yüklenemedi:`, err);
            }
          }
        })
      );
      
      if (Object.keys(newTools).length > 0) {
        setTools(prev => ({ ...prev, ...newTools }));
      }
    };

    if (reservations.length > 0) {
      loadTools();
    }
  }, [reservations]);

  // Rezervasyon durumunu belirle
  const getReservationStatus = (reservation: Reservation) => {
    const now = new Date();
    const startDate = new Date(reservation.start_t);
    const endDate = new Date(reservation.end_t);

    if (now < startDate) {
      return { label: 'Beklemede', color: 'yellow', icon: Clock };
    } else if (now >= startDate && now <= endDate) {
      return { label: 'Aktif', color: 'green', icon: CheckCircle };
    } else {
      return { label: 'Tamamlandı', color: 'gray', icon: XCircle };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p>Rezervasyonlar yükleniyor...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-white rounded-2xl shadow-sm p-8">
        <Calendar className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-medium text-gray-600">Henüz kiralama yapmadınız</h3>
        <p className="text-sm text-center mt-2">İhtiyacınız olan aletleri vitrinde bulabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Rezervasyonlarım</h2>
      {reservations.map((reservation) => {
        const tool = tools[reservation.tool_id];
        const status = getReservationStatus(reservation);
        const StatusIcon = status.icon;
        
        const colorClasses = {
          yellow: 'bg-yellow-100 text-yellow-700 border-yellow-400',
          green: 'bg-green-100 text-green-700 border-green-400',
          gray: 'bg-gray-100 text-gray-600 border-gray-400',
        };

        return (
          <div 
            key={reservation.reservation_id} 
            className={`bg-white p-4 md:p-6 rounded-2xl shadow-sm border-l-4 ${
              status.color === 'yellow' ? 'border-yellow-400' : 
              status.color === 'green' ? 'border-green-400' : 'border-gray-400'
            } flex gap-4 md:gap-6`}
          >
            {/* Tool Görseli (Placeholder) */}
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-8 h-8 md:w-12 md:h-12 text-gray-300" />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <h3 className="font-bold text-gray-800">
                  {tool?.tool_name || `Alet #${reservation.tool_id}`}
                </h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                  colorClasses[status.color as keyof typeof colorClasses]
                }`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 mt-1">
                Rezervasyon #{reservation.reservation_id}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Başlangıç:</span>
                  <span>{new Date(reservation.start_t).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-red-500" />
                <span className="font-medium">Bitiş:</span>
                <span>{new Date(reservation.end_t).toLocaleDateString('tr-TR')}</span>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Oluşturuldu: {new Date(reservation.created_at).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
