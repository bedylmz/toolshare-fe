// src/components/ReservationModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Calendar, ChevronLeft, ChevronRight, Wrench, AlertCircle, Loader2 } from 'lucide-react';
import { Tool, ToolAvailability, toolApi } from '../services/api';

interface ReservationModalProps {
  tool: Tool;
  ownerName?: string;
  currentUserName: string;
  onConfirm: (startDate: Date, endDate: Date) => void;
  onClose: () => void;
}

// Ay isimleri
const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function ReservationModal({ tool, ownerName, currentUserName, onConfirm, onClose }: ReservationModalProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Müsaitlik state'leri
  const [availability, setAvailability] = useState<ToolAvailability[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Müsaitlik verilerini yükle
  useEffect(() => {
    const fetchAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError(null);
      try {
        // 90 gün ileriye kadar müsaitlik bilgisi al
        const data = await toolApi.getAvailability(tool.tool_id, undefined, 90);
        console.log('Müsaitlik verisi:', data);
        console.log('Müsait olmayan günler:', data.filter(d => !d.is_available));
        setAvailability(data);
      } catch (err) {
        console.error('Müsaitlik bilgisi alınamadı:', err);
        setAvailabilityError('Müsaitlik bilgisi yüklenemedi');
      } finally {
        setAvailabilityLoading(false);
      }
    };

    fetchAvailability();
  }, [tool.tool_id]);

  // API'den gelen check_date formatını normalize et (YYYY-MM-DD)
  const normalizeDate = (dateStr: string): string => {
    // Eğer tarih T içeriyorsa (ISO format), sadece tarih kısmını al
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    return dateStr;
  };

  // Tarihi YYYY-MM-DD formatına çevir (karşılaştırma için)
  const getDateString = (day: number): string => {
    const year = currentYear;
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  // Belirli bir tarihin mevcut kullanıcı tarafından rezerve edilip edilmediğini kontrol et
  const isMyReservation = (day: number): boolean => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);
    
    for (const item of availability) {
      if (!item.is_available && item.reservation_start && item.reservation_end) {
        const startDate = new Date(item.reservation_start);
        const endDate = new Date(item.reservation_end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        if (checkDate >= startDate && checkDate <= endDate) {
          // borrower_name ile karşılaştır
          if (item.borrower_name === currentUserName) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Belirli bir tarihin müsait olup olmadığını kontrol et
  const isUnavailable = (day: number): boolean => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);
    
    // Tüm rezervasyonları kontrol et
    for (const item of availability) {
      if (!item.is_available && item.reservation_start && item.reservation_end) {
        // Başlangıç ve bitiş tarihlerini parse et
        const startDate = new Date(item.reservation_start);
        const endDate = new Date(item.reservation_end);
        
        // Sadece gün bazında karşılaştır (saat kısmını sıfırla)
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999); // Bitiş gününü tam olarak dahil et
        
        // checkDate, başlangıç ve bitiş arasında mı? (bitiş dahil)
        if (checkDate >= startDate && checkDate <= endDate) {
          // Kendi rezervasyonum değilse müsait değil
          if (item.borrower_name !== currentUserName) {
            return true;
          }
        }
      }
    }
    
    // Ayrıca API'den direkt is_available: false geliyorsa kontrol et
    const dateStr = getDateString(day);
    const availabilityInfo = availability.find(a => normalizeDate(a.check_date) === dateStr);
    if (availabilityInfo && !availabilityInfo.is_available) {
      // Kendi rezervasyonum değilse müsait değil
      if (availabilityInfo.borrower_name !== currentUserName) {
        return true;
      }
    }
    
    return false;
  };

  // Belirli bir tarihin rezervasyon bilgisini al
  const getReservationInfo = (day: number): ToolAvailability | undefined => {
    const dateStr = getDateString(day);
    return availability.find(a => normalizeDate(a.check_date) === dateStr);
  };

  // Ayın günlerini hesapla
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Ayın ilk gününün haftanın hangi günü olduğunu bul (Pazartesi = 0)
  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Pazar = 6, Pazartesi = 0
  };

  // Önceki aya git
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Sonraki aya git
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Tarihi YYYY-MM-DD formatına çevir (API için)
  const formatDateForApi = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Seçilen aralıkta BAŞKASININ rezervasyonu var mı kontrol et
  // (Kendi rezervasyonlarımız OK - backend birleştirecek)
  const hasOtherUserReservationInRange = (start: Date, end: Date): boolean => {
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDate();
      const month = current.getMonth();
      const year = current.getFullYear();
      
      // Bu gün için kontrol (sadece mevcut ayda ise)
      if (month === currentMonth && year === currentYear) {
        // Müsait değil VE benim rezervasyonum değilse engelle
        if (isUnavailable(day)) {
          return true; // Başkasının rezervasyonu var
        }
      }
      
      current.setDate(current.getDate() + 1);
    }
    return false;
  };

  // Tarih seçimi
  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentYear, currentMonth, day);
    clickedDate.setHours(0, 0, 0, 0);

    // Geçmiş tarihleri seçme
    if (clickedDate < today) return;

    // Başkasının rezervasyonu olan günleri seçme (kendi günlerimiz OK)
    if (isUnavailable(day)) return;

    // Validation hatasını temizle
    setValidationError(null);

    if (!startDate || (startDate && endDate)) {
      // İlk seçim veya yeniden seçim
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (clickedDate < startDate) {
      // Başlangıçtan önce seçildi
      setStartDate(clickedDate);
      setEndDate(null);
    } else {
      // Aralıkta başkasının rezervasyonu var mı kontrol et
      if (hasOtherUserReservationInRange(startDate, clickedDate)) {
        setValidationError('Seçilen aralıkta başkasının rezervasyonu var');
        return;
      }
      
      // Bitiş tarihi seçildi - backend kontrolü yapacak
      setEndDate(clickedDate);
    }
  };

  // Tarihin seçili aralıkta olup olmadığını kontrol et
  const isInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date >= startDate && date <= endDate;
  };

  // Tarihin başlangıç mı bitiş mi olduğunu kontrol et
  const isStartOrEnd = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (date.getTime() === start.getTime()) return 'start';
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);
      if (date.getTime() === end.getTime()) return 'end';
    }
    return null;
  };

  // Geçmiş tarih mi kontrol et
  const isPastDate = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Takvimi oluştur
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days: React.ReactNode[] = [];

    // Boş günler
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    // Ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const position = isStartOrEnd(day);
      const inRange = isInRange(day);
      const past = isPastDate(day);
      const unavailable = isUnavailable(day);
      const myReservation = isMyReservation(day);
      const reservationInfo = getReservationInfo(day);

      days.push(
        <div key={day} className="relative group">
          <button
            onClick={() => handleDateClick(day)}
            disabled={past || unavailable || validationLoading}
            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
              ${past 
                ? 'text-gray-300 cursor-not-allowed' 
                : myReservation
                  ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200 ring-2 ring-green-400'
                  : unavailable
                    ? 'bg-red-100 text-red-600 cursor-not-allowed hover:bg-red-200'
                    : 'hover:bg-blue-100 cursor-pointer'
              }
              ${position === 'start' || position === 'end'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : ''
              }
              ${inRange && !position
                ? 'bg-blue-100 text-blue-700'
                : ''
              }
              ${!past && !unavailable && !position && !inRange
                ? 'text-gray-700'
                : ''
              }
            `}
          >
            {day}
          </button>
          {/* Müsait olmayan gün tooltip */}
          {unavailable && reservationInfo?.borrower_name && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              {reservationInfo.borrower_name} tarafından rezerve
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Gün sayısını hesapla
  const getDayCount = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Rezervasyonu onayla
  const handleConfirm = async () => {
    if (!startDate || !endDate) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(startDate, endDate);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Kiralama Tarihi Seç</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tool Info */}
        <div className="px-4 py-3 bg-gray-50 flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Wrench className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{tool.tool_name}</h3>
            <p className="text-sm text-gray-500">
              {ownerName ? `Sahibi: ${ownerName}` : `Sahip #${tool.user_id}`}
            </p>
          </div>
        </div>

        {/* Calendar */}
        <div className="p-4">
          {/* Availability Loading */}
          {availabilityLoading && (
            <div className="flex items-center justify-center py-8 gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Müsaitlik bilgisi yükleniyor...</span>
            </div>
          )}

          {/* Availability Error */}
          {availabilityError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{availabilityError}</span>
            </div>
          )}

          {!availabilityLoading && (
            <>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h3 className="font-semibold text-gray-800">
                  {MONTHS[currentMonth]} {currentYear}
                </h3>
                <button 
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span className="text-gray-600">Seçili</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-green-100 border-2 border-green-400"></div>
                  <span className="text-gray-600">Senin Rez.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200"></div>
                  <span className="text-gray-600">Dolu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"></div>
                  <span className="text-gray-600">Müsait</span>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendar()}
              </div>

              {/* Validation Loading */}
              {validationLoading && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl flex items-center gap-2 text-blue-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Müsaitlik kontrol ediliyor...</span>
                </div>
              )}

              {/* Validation Error */}
              {validationError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{validationError}</span>
                </div>
              )}

              {/* Selection Info */}
              {!validationLoading && !validationError && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {startDate && endDate ? (
                        <>
                          {startDate.toLocaleDateString('tr-TR')} - {endDate.toLocaleDateString('tr-TR')}
                          <span className="ml-2 text-blue-500">({getDayCount()} gün)</span>
                        </>
                      ) : startDate ? (
                        <>
                          {startDate.toLocaleDateString('tr-TR')} - <span className="text-blue-400">Bitiş seçin</span>
                        </>
                      ) : (
                        'Başlangıç tarihi seçin'
                      )}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!startDate || !endDate || isSubmitting || validationLoading || availabilityLoading}
            className={`flex-1 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
              startDate && endDate && !isSubmitting && !validationLoading && !availabilityLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>İşleniyor...</span>
              </>
            ) : (
              'Rezervasyon Yap'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

