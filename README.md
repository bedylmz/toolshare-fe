# 🔧 ToolShare - Mahalle Alet Paylaşım Platformu

Komşularınızla alet paylaşmanızı sağlayan modern bir web uygulaması. Kullanmadığınız aletleri paylaşın, ihtiyacınız olanları kiralayın!

## 🚀 Özellikler

### 👤 Kullanıcı Yönetimi
- Kayıt ve giriş sistemi
- Kullanıcı profili ve istatistikleri
- Ortalama puan ve değerlendirme sayısı

### 🛠️ Alet Yönetimi
- Alet ekleme ve listeleme
- Kategorilere göre filtreleme
- Durum filtreleri:
  - **Tümü** - Tüm aletler
  - **Müsait** - Şu an kiralanabilir
  - **Kirada** - Şu an başkası tarafından kiralanmış
  - **Hiç Kiralanmamış** - Yeni eklenen aletler

### 📅 Rezervasyon Sistemi
- Takvim tabanlı tarih seçimi
- Müsaitlik kontrolü (90 gün ileriye kadar)
- Akıllı renk kodlaması:
  - 🔵 **Mavi** - Seçtiğiniz tarihler
  - 🟢 **Yeşil** - Sizin mevcut rezervasyonunuz
  - 🔴 **Kırmızı** - Başkasının rezervasyonu
  - ⚪ **Beyaz** - Müsait günler
- Otomatik rezervasyon birleştirme (çakışan tarihlerde)

### 🔔 Bildirim Sistemi
- Başarılı/hata bildirimleri
- Toast mesajları

## 🏗️ Proje Yapısı

```
src/
├── components/
│   ├── ReservationModal.tsx  # Tarih seçimi ve rezervasyon modalı
│   └── UI.tsx                # Header, NavButton, ProfileMenuItem
├── pages/
│   ├── AuthPage.tsx          # Giriş/Kayıt sayfası
│   ├── Marketplace.tsx       # Ana vitrin sayfası
│   ├── AddToolForm.tsx       # Alet ekleme formu
│   ├── Reservations.tsx      # Kiralamalarım listesi
│   └── UserProfile.tsx       # Kullanıcı profili
├── services/
│   └── api.ts                # API servisleri ve tipler
├── hooks/
│   └── useTools.ts           # Tool verilerini çeken custom hook
├── App.tsx                   # Ana uygulama bileşeni
└── main.tsx                  # Giriş noktası
```

## 🔌 API Endpoints

### User API
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/USER/` | Yeni kullanıcı oluştur |
| POST | `/USER/login` | Giriş yap |
| GET | `/USER/{id}` | Kullanıcı bilgisi |
| GET | `/USER/{id}/tools` | Kullanıcının aletleri |
| GET | `/USER/{id}/reservations` | Kullanıcının rezervasyonları |

### Tool API
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/TOOL/` | Tüm aletler |
| POST | `/TOOL/` | Yeni alet ekle |
| GET | `/TOOL/by-status?filter_type=` | Duruma göre filtrele |
| GET | `/TOOL/{id}/availability` | Alet müsaitlik takvimi |
| GET | `/TOOL/available` | Belirli tarihlerde müsait aletler |

### Reservation API
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/RESERVATION/` | Yeni rezervasyon (veya mevcut uzatma) |
| GET | `/RESERVATION/` | Aktif rezervasyonlar |
| PATCH | `/RESERVATION/{id}/finish` | Rezervasyonu bitir |

### Category API
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/CATEGORY/` | Tüm kategoriler |
| GET | `/CATEGORY/{id}/tools` | Kategorideki aletler |

## 🛠️ Teknolojiler

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - İkonlar
- **LocalStorage** - Oturum yönetimi

## 📦 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat
npm run dev

# Production build
npm run build
```

## ⚙️ Yapılandırma

API URL'i `src/services/api.ts` dosyasında tanımlıdır:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## 🎨 UI/UX Özellikleri

- **Responsive tasarım** - Mobil ve masaüstü uyumlu
- **Mobil navigasyon** - Alt menü çubuğu
- **Masaüstü navigasyon** - Üst menü
- **Modern gradient tasarım** - Auth sayfası
- **Animasyonlar** - Yumuşak geçişler ve hover efektleri

## 📱 Ekran Görüntüleri

### Giriş Sayfası
- Gradient arka plan
- Tab sistemi (Giriş/Kayıt)
- Şifre göster/gizle

### Vitrin (Marketplace)
- Arama çubuğu
- Durum filtreleri
- Alet kartları (sahip bilgisi, durum badge'i)

### Rezervasyon Modalı
- Takvim görünümü
- Renk kodlu günler
- Legend açıklaması

## 🔐 Kimlik Doğrulama

Uygulama LocalStorage'da kullanıcı bilgisini saklar:
- Anahtar: `toolshare_user`
- Sayfa yenilendiğinde oturum korunur
- Çıkış yapıldığında temizlenir

## 📄 Lisans

MIT License
