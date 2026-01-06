// src/data.js

export const INITIAL_TOOLS = [
    {
      id: 1,
      title: "Bosch Profesyonel Matkap",
      category: "Tadilat",
      price: 50,
      period: "günlük",
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800",
      owner: "Ahmet Y.",
      ownerScore: 4.8,
      distance: "300m",
      available: true,
      description: "Darbeli matkap, beton delmek için uçları mevcut. Kutusuyla verilecektir."
    },
    {
      id: 2,
      title: "Kamp Çadırı (4 Kişilik)",
      category: "Outdoor",
      price: 150,
      period: "günlük",
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
      owner: "Selin K.",
      ownerScore: 4.9,
      distance: "1.2km",
      available: true,
      description: "Sadece 2 kez kullanıldı, temiz ve eksiksiz. Kurulumu çok basit."
    },
    {
      id: 3,
      title: "Merdiven (3 Metre)",
      category: "Tadilat",
      price: 30,
      period: "günlük",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
      owner: "Mehmet B.",
      ownerScore: 4.5,
      distance: "500m",
      available: true,
      description: "Katlanabilir alüminyum merdiven. Hafif ve taşıması kolay."
    },
    {
      id: 4,
      title: "DSLR Kamera Tripodu",
      category: "Elektronik",
      price: 75,
      period: "günlük",
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800",
      owner: "Canan T.",
      ownerScore: 5.0,
      distance: "Yan Bina",
      available: false,
      description: "Profesyonel çekimler için sağlam tripod."
    }
  ];
  
  export const CATEGORIES = ["Tümü", "Tadilat", "Bahçe", "Elektronik", "Outdoor", "Temizlik"];