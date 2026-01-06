// src/pages/AddToolForm.tsx
import React, { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { X, Upload, ImagePlus } from 'lucide-react';
import { CATEGORIES } from '../data';
import { Tool } from './Marketplace'; // Marketplace'te tanımladığımız Tool interface'ini import ediyoruz

// Sadece formun içindeki verileri temsil eden interface
interface FormData {
  title: string;
  category: string;
  price: string; // Input'tan string olarak gelir, sonra number'a çevrilebilir
  description: string;
  image: string; // Base64 encoded image
}

interface AddToolFormProps {
  onAdd: (newTool: Tool) => void;
  onCancel: () => void;
}

export default function AddToolForm({ onAdd, onCancel }: AddToolFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: 'Tadilat',
    price: '',
    description: '',
    image: '',
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Tool interface'ine uygun yeni nesne oluşturuyoruz
    const newTool: Tool = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      price: Number(formData.price),
      description: String(formData.description),
      image: formData.image || "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=800",
      owner: "Ben",
      ownerScore: 5.0,
      distance: "Bende",
      period: "günlük",
      available: true
    };
    
    onAdd(newTool);
  };

  // Input değişimlerini yönetmek için yardımcı fonksiyon (opsiyonel ama temiz tutar)
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Resim dosyasını base64'e çevir
  const handleImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Alet Paylaş</h2>
        <button onClick={onCancel} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resim Yükleme Alanı */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alet Fotoğrafı</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          
          {formData.image ? (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <img 
                src={formData.image} 
                alt="Yüklenen resim" 
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg text-sm font-medium hover:bg-white transition-colors shadow-lg flex items-center gap-1"
              >
                <Upload size={14} />
                Değiştir
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-gray-100'
              }`}
            >
              <ImagePlus className={`w-12 h-12 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-600 font-medium">
                {isDragging ? 'Bırakın...' : 'Fotoğraf yüklemek için tıklayın'}
              </p>
              <p className="text-xs text-gray-400 mt-1">veya sürükle & bırak</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alet Adı</label>
          <input 
            required
            name="title"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Örn: Bosch Darbeli Matkap"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select 
              name="category"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORIES.filter(c => c !== 'Tümü').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Günlük Ücret (₺)</label>
            <input 
              required
              name="price"
              type="number"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none"
              placeholder="0"
              value={formData.price}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
          <textarea 
            name="description"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-32 resize-none"
            placeholder="Aletin durumu, kullanım şartları vb."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            İlanı Yayınla
          </button>
        </div>
      </form>
    </div>
  );
}