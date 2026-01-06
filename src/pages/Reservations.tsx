// src/pages/Reservations.tsx
import React from 'react';
import { Calendar } from 'lucide-react';
import { Tool } from './Marketplace'; // Daha önce tanımladığımız Tool interface'ini import ediyoruz

// Rezervasyon nesnesinin yapısını tanımlıyoruz
export interface Reservation {
  id: number | string;
  tool: Tool;
  status: 'Beklemede' | 'Onaylandı' | 'Tamamlandı' | string; // Belirli durumları veya genel string'i kabul eder
  date: string;
}

// Props arayüzü
interface ReservationsProps {
  reservations: Reservation[];
}

export default function Reservations({ reservations }: ReservationsProps) {
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
      {reservations.map((res: Reservation) => (
        <div key={res.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border-l-4 border-yellow-400 flex gap-4 md:gap-6">
          <img 
            src={res.tool.image} 
            className="w-20 h-20 md:w-28 md:h-28 rounded-lg object-cover bg-gray-200 flex-shrink-0" 
            alt={res.tool.title} 
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-800">{res.tool.title}</h3>
              <span className="text-xs font-bold px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                {res.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Sahibi: {res.tool.owner}</p>
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{res.date}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}