// src/pages/Reservations.tsx
import React, { useEffect, useState } from 'react';
import { Calendar, Wrench, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Reservation, Tool, toolApi, analyticsApi, BorrowHistoryItem } from '../services/api';

// Props arayüzü
interface ReservationsProps {
  reservations: Reservation[];
  loading?: boolean;
  currentUserId?: number;
}

// Tool cache'i için tip
type ToolCache = Record<number, Tool>;

export default function Reservations({ reservations, loading = false, currentUserId }: ReservationsProps) {
  const [tools, setTools] = useState<ToolCache>({});
  const [borrowHistory, setBorrowHistory] = useState<BorrowHistoryItem[]>([]);
  const [useEnhancedData, setUseEnhancedData] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Gelişmiş geçmiş verilerini yükle
  useEffect(() => {
    if (!useEnhancedData || !currentUserId) {
      setUseEnhancedData(false);
      return;
    }

    const loadBorrowHistory = async () => {
      setHistoryLoading(true);
      try {
        const history = await analyticsApi.getBorrowHistory(currentUserId, 50);
        setBorrowHistory(history);
      } catch (err) {
        console.error('Kiralama geçmişi yükleme hatası:', err);
        setUseEnhancedData(false);
      } finally {
        setHistoryLoading(false);
      }
    };

    loadBorrowHistory();
  }, [useEnhancedData, currentUserId]);

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Rezervasyonlarım</h2>
        {currentUserId && (
          <button
            onClick={() => setUseEnhancedData(!useEnhancedData)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              useEnhancedData
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            {historyLoading ? 'Yükleniyor...' : 'Gelişmiş Veriler'}
          </button>
        )}
      </div>

      {/* Gelişmiş Geçmiş Verisi */}
      {useEnhancedData && currentUserId && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl">
          <h3 className="font-bold text-gray-800 mb-3 text-sm">Kiralama Geçmişi (Detaylı)</h3>
          {historyLoading ? (
            <div className="flex items-center justify-center py-4">
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></span>
              <span className="text-gray-600">Yükleniyor...</span>
            </div>
          ) : borrowHistory.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {borrowHistory.map(item => (
                <div key={item.reservation_id} className="bg-white p-3 rounded-lg text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-800">{item.tool_name}</p>
                      <p className="text-xs text-gray-500">{item.owner_name} tarafından kiralandı</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      item.status === 'Aktif' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(item.start_t).toLocaleDateString('tr-TR')} - {new Date(item.end_t).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm text-center py-2">Kiralama geçmişi bulunamadı.</p>
          )}
        </div>
      )}

      {/* Standart Rezervasyon Listesi */}
      <div className="space-y-4">
        {(useEnhancedData ? borrowHistory : reservations).map((item) => {
          const isEnhanced = 'owner_name' in item;
          const reservation = !isEnhanced ? item : null;
          const historyItem = isEnhanced ? item : null;

          if (isEnhanced && historyItem) {
            // Gelişmiş veri gösterimi (kiralama geçmişi)
            return (
              <div
                key={historyItem.reservation_id}
                className={`bg-white p-4 md:p-6 rounded-2xl shadow-sm border-l-4 ${
                  historyItem.status === 'Aktif'
                    ? 'border-green-400'
                    : 'border-gray-400'
                } flex gap-4 md:gap-6`}
              >
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-8 h-8 md:w-12 md:h-12 text-gray-300" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h3 className="font-bold text-gray-800">{historyItem.tool_name}</h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                        historyItem.status === 'Aktif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {historyItem.status === 'Aktif' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {historyItem.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    Sahibi: {historyItem.owner_name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Rezervasyon #{historyItem.reservation_id}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">Başlangıç:</span>
                      <span>{new Date(historyItem.start_t).toLocaleDateString('tr-TR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span className="font-medium">Bitiş:</span>
                    <span>{new Date(historyItem.end_t).toLocaleDateString('tr-TR')}</span>
                  </div>

                  <p className="text-xs text-gray-400 mt-2">
                    Oluşturuldu: {new Date(historyItem.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            );
          } else if (!isEnhanced && reservation) {
            // Standart rezervasyon gösterimi
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
                  status.color === 'yellow'
                    ? 'border-yellow-400'
                    : status.color === 'green'
                      ? 'border-green-400'
                      : 'border-gray-400'
                } flex gap-4 md:gap-6`}
              >
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-8 h-8 md:w-12 md:h-12 text-gray-300" />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <h3 className="font-bold text-gray-800">
                      {tool?.tool_name || `Alet #${reservation.tool_id}`}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                        colorClasses[status.color as keyof typeof colorClasses]
                      }`}
                    >
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
          }
        })}
      </div>
    </div>
  );
}
