// src/pages/Marketplace.tsx
import React, { ChangeEvent } from 'react';
import { Search, MapPin, Star, Hammer } from 'lucide-react';
import { CATEGORIES } from '../data';

// Tool nesnesinin veri yapısını tanımlıyoruz
export interface Tool {
  id: number | string;
  title: string;
  category: string;
  description?: string;
  image: string;
  owner: string;
  ownerScore: number;
  distance: string;
  price: number;
  period: string;
  available: boolean;
}

// Props arayüzünü tanımlıyoruz
interface MarketplaceProps {
  tools: Tool[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onReserve: (tool: Tool) => void;
}

export default function Marketplace({ 
  tools, 
  searchTerm, 
  setSearchTerm, 
  selectedCategory, 
  setSelectedCategory, 
  onReserve 
}: MarketplaceProps) {
  
  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Tümü' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Input değişimi için tip güvenliği
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-6">
      {/* Arama ve Filtreleme */}
      <div className="bg-white p-4 rounded-2xl shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Ne aramıştınız? (Matkap, Çadır...)" 
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* İlan Listesi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredTools.map(tool => (
          <div key={tool.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
            {/* Owner Bilgisi - Üst Kısım */}
            <div className="p-3 flex items-center gap-3 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {tool.owner.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">{tool.owner}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{tool.ownerScore}</span>
                </div>
              </div>
            </div>

            {/* Tool Resmi */}
            <div className="relative h-48 bg-gray-200">
              <img src={tool.image} alt={tool.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-md text-xs backdrop-blur-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {tool.distance}
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 line-clamp-1">{tool.title}</h3>
                <div className="text-right">
                  <span className="text-lg font-bold text-blue-600">{tool.price}₺</span>
                  <span className="text-xs text-gray-400 block">/{tool.period}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <button 
                  onClick={() => onReserve(tool)}
                  disabled={!tool.available}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    tool.available 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {tool.available ? 'Hemen Kirala' : 'Müsait Değil'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredTools.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Hammer className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Aradığınız kriterlere uygun alet bulunamadı.</p>
        </div>
      )}
    </div>
  );
}