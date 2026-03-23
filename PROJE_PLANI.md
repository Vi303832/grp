# Kampanya ve Kupon Platformu — MVP Proje Planı

## Proje Amacı

Kullanıcıların kampanyaları görüntüleyebildiği, satın alabildiği ve satın alma sonrası kupon aldığı bir kampanya platformu.
İlk aşamada yalnızca **Bursa** için aktif olacak; altyapı ilerleyen dönemde diğer şehirleri destekleyecek şekilde kurulacaktır.

---

## Tech Stack

| Katman | Teknoloji | Neden |
|---|---|---|
| Frontend | Vite + React + Tailwind CSS | Hızlı geliştirme, modern UI |
| State Yönetimi | Zustand | Redux'tan hafif, Context'ten güçlü |
| Server State | TanStack Query (React Query) | Cache, loading, refetch otomatik |
| Form | React Hook Form + Zod | Performanslı form, tip güvenli validasyon |
| Backend | Firebase Cloud Functions (Node.js) | Sunucusuz, ölçeklenebilir |
| Veritabanı | Firebase Firestore | Gerçek zamanlı, NoSQL, şehir bazlı sorgulara uygun |
| Auth | Firebase Authentication | Hazır, güvenli, custom claims ile rol desteği |
| Dosya Depolama | Firebase Storage | Kampanya görselleri, CDN ile hızlı |
| Hosting | Firebase Hosting | Tek ekosistem, kolay deploy |
| Ödeme | iyzico | Türkiye'nin en yaygın gateway'i, iyi dokümantasyon |
| Email | Resend | Basit API, Cloud Functions ile kolay entegrasyon |
| Bildirim | react-hot-toast | Kullanıcı geri bildirimleri |

> Ayrı bir Node.js sunucusu kurulmayacak. Tüm backend işlemleri Firebase Cloud Functions üzerinden yürütülecek.

---

## Proje Klasör Yapısı

```
src/
├── features/               # Her özellik kendi modülü
│   ├── auth/               # Giriş, kayıt, şifre sıfırlama
│   ├── campaigns/          # Kampanya listeleme, detay
│   ├── orders/             # Satın alma akışı
│   ├── coupons/            # Kupon görüntüleme, doğrulama
│   ├── user-panel/         # Kullanıcı profili, geçmişi
│   ├── business/           # İşletme doğrulama sayfası
│   └── admin/              # Admin panel modülleri
│
├── components/
│   ├── ui/                 # Temel bileşenler (Button, Input, Modal, Badge...)
│   └── layout/             # Navbar, Footer, PageWrapper, Sidebar
│
├── hooks/                  # Paylaşılan custom hook'lar
├── lib/
│   ├── firebase.js         # Firebase init (tek nokta)
│   ├── iyzico.js           # Ödeme yardımcıları
│   └── utils.js            # Genel yardımcı fonksiyonlar
│
├── store/                  # Zustand store'ları
├── types/                  # Veri tipleri / şemalar (Zod)
├── pages/                  # Route seviyesindeki sayfalar
└── router/                 # React Router tanımları, guard'lar
```

---

## Firestore Veri Modeli

### `users/{userId}`
```
{
  displayName: string
  email: string
  phone: string
  cityId: string
  role: "user" | "business" | "admin"
  createdAt: Timestamp
}
```

### `businesses/{businessId}`
```
{
  name: string
  ownerId: string           // users/{userId}
  contactEmail: string
  phone: string
  address: string
  cityId: string
  isActive: boolean
  createdAt: Timestamp
}
```

### `cities/{cityId}`
```
{
  name: string              // "Bursa"
  slug: string              // "bursa"
  isActive: boolean
}
```

### `categories/{categoryId}`
```
{
  name: string              // "Spa"
  slug: string              // "spa"
  icon: string
  order: number
}
```

### `campaigns/{campaignId}`
```
{
  title: string
  slug: string              // SEO uyumlu URL: "bursa-spa-50-indirim"
  description: string
  businessId: string
  cityId: string
  categoryId: string
  price: number
  originalPrice: number
  images: string[]          // Storage URL'leri
  quota: number             // Maksimum satış adedi (0 = sınırsız)
  soldCount: number         // Satılan adet (transaction ile güncellenir)
  isActive: boolean
  isFeatured: boolean
  expiresAt: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### `orders/{orderId}`
```
{
  userId: string
  campaignId: string
  businessId: string
  status: "pending" | "paid" | "coupon_issued" | "cancelled" | "refunded"
  amount: number
  paymentId: string         // iyzico payment referansı
  paymentToken: string      // iyzico token
  createdAt: Timestamp
  paidAt: Timestamp | null
}
```

### `coupons/{couponId}`
```
{
  code: string              // "GRP-4K8D1A"
  orderId: string
  userId: string
  campaignId: string
  businessId: string
  status: "active" | "used" | "expired" | "cancelled"
  usedAt: Timestamp | null
  expiresAt: Timestamp
  createdAt: Timestamp
}
```

### `homepage_sections/{sectionId}`
```
{
  title: string             // "Ramazan Kampanyaları"
  slug: string
  order: number
  isActive: boolean
  campaignIds: string[]     // Sıralı kampanya referansları
}
```

### `applications/{applicationId}`
```
{
  businessName: string
  campaignTitle: string
  description: string
  contactEmail: string
  contactPhone: string
  status: "pending" | "reviewed" | "approved" | "rejected"
  createdAt: Timestamp
}
```

---

## Sipariş Durum Makinesi

```
pending ──► paid ──► coupon_issued ──► [kupon: active]
   │                                         │
   └──► cancelled              used / expired / cancelled
         │
        paid ──► refunded
```

- `pending` → Kullanıcı ödeme sayfasına yönlendirildi
- `paid` → iyzico webhook onayladı (Cloud Function)
- `coupon_issued` → Kupon üretildi ve kullanıcıya atandı
- `cancelled` → Ödeme başarısız veya kullanıcı iptal etti
- `refunded` → Admin tarafından iade edildi

---

## Cloud Functions Listesi

| Fonksiyon | Tetikleyici | Görev |
|---|---|---|
| `createOrder` | HTTP | Sipariş oluştur, iyzico ödeme başlat |
| `iyzicoWebhook` | HTTP | Ödeme onayı al, kuponu üret |
| `validateCoupon` | HTTP | İşletme kupon doğrulama (kendi kampanyası kontrolü) |
| `useCoupon` | HTTP | Kuponu "kullanıldı" işaretle (transaction) |
| `sendOrderEmail` | Firestore trigger | Sipariş tamamlandığında email gönder |
| `generateCouponCode` | Internal | Benzersiz GRP-XXXXXX üret (çakışma kontrolü ile) |

---

## Güvenlik Prensipleri

- **Firestore Security Rules** M1'de tasarlanır, her milestone'da güncellenir
- **Ödeme işlemleri** yalnızca Cloud Functions'ta, client-side asla
- **Kupon doğrulama** yalnızca Cloud Functions üzerinden (client Firestore yazamaz)
- **Stok kontrolü** Firestore transaction ile (race condition önlenir)
- **İşletme izolasyonu** — işletme yalnızca kendi `businessId`'sine ait kuponları doğrulayabilir
- **Admin koruması** — admin route'ları custom claim kontrolü yapar

---

## Geliştirme Ortamı

- **Firebase Emulators** yerel geliştirme için (Auth, Firestore, Functions, Storage)
- **`.env.local`** — Firebase config, iyzico anahtarları
- **`.env.production`** — Production anahtarları
- Dev ve production için ayrı Firebase projeleri önerilir

---

## Milestone Planı

### Milestone 1 — Temel Altyapı & Auth
> Tahmini süre: 1.5 hafta

- [ ] Firebase projesi kurulumu (dev + prod ayrı)
- [ ] Firebase Emulators yapılandırması (yerel geliştirme)
- [ ] Paket kurulumu: `firebase`, `react-router-dom`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `react-hot-toast`
- [ ] Klasör yapısının kurulumu (feature-based)
- [ ] Temel UI bileşenleri: Button, Input, Modal, Badge, Spinner, Card
- [ ] Layout bileşenleri: Navbar, Footer, PageWrapper
- [ ] React Router kurulumu + protected route guard'ları (role bazlı)
- [ ] Kullanıcı kayıt / giriş / çıkış (Firebase Auth — email & password)
- [ ] Firebase Custom Claims ile rol atama: `user`, `business`, `admin`
- [ ] Firestore Security Rules v1 (temel okuma/yazma kuralları)
- [ ] Firestore başlangıç verileri: şehirler (Bursa), kategoriler
- [ ] Zustand auth store

---

### Milestone 2 — Ana Sayfa & Kampanya Listeleme
> Tahmini süre: 1 – 1.5 hafta

- [ ] Landing page: banner, homepage sections (TanStack Query ile Firestore'dan)
- [ ] Kampanya kart bileşeni (görsel, başlık, fiyat, eski fiyat)
- [ ] Kampanya listeleme sayfası
- [ ] Şehir / kategori filtresi + arama (Firestore composite index)
- [ ] Infinite scroll veya sayfalama
- [ ] `react-helmet-async` ile sayfa bazlı meta tag / SEO
- [ ] Tam mobil uyumluluk
- [ ] Resim lazy loading

---

### Milestone 3 — Kampanya Detay & Satın Alma & Kupon
> Tahmini süre: 2 – 2.5 hafta

**Kampanya Detay:**
- [ ] Kampanya detay sayfası (`/kampanya/[slug]`)
- [ ] Görsel galeri, açıklama, fiyat, stok durumu

**Satın Alma Akışı:**
- [ ] `createOrder` Cloud Function (sipariş oluştur + iyzico ödeme başlat)
- [ ] iyzico ödeme formu entegrasyonu
- [ ] `iyzicoWebhook` Cloud Function (ödeme onayı → kupon üret)
- [ ] Stok kontrolü Firestore transaction ile (race condition önlemi)
- [ ] Sipariş durum takibi (pending → paid → coupon_issued)

**Kupon & Email:**
- [ ] Benzersiz kupon kodu üretimi (`GRP-XXXXXX`, çakışma kontrolü)
- [ ] Satın alma sonrası email (Resend): kupon kodu + sipariş özeti
- [ ] Kullanıcı paneli:
  - Profil sayfası
  - Satın Aldıklarım (sipariş geçmişi + durum)
  - Kuponlarım (kod, durum, son kullanım tarihi)

---

### Milestone 4 — İşletme Doğrulama & Kampanya Başvurusu
> Tahmini süre: 0.5 – 1 hafta

- [ ] İşletme giriş akışı (business custom claim)
- [ ] Kupon doğrulama sayfası: kod gir → `validateCoupon` Cloud Function
- [ ] `useCoupon` Cloud Function: kuponu "kullanıldı" işaretle
- [ ] İşletme izolasyonu: yalnızca kendi `businessId` kuponlarına erişim
- [ ] Kampanya başvuru formu (Zod validasyonlu)
- [ ] Firestore Security Rules güncellemesi (işletme izinleri)

---

### Milestone 5 — Admin Panel & Genel İyileştirmeler
> Tahmini süre: 2 hafta

**Admin Panel:**
- [ ] Kampanya yönetimi: oluştur / düzenle / sil (görsel yükleme Firebase Storage'a)
- [ ] Sipariş yönetimi: liste, detay, durum güncelleme
- [ ] Kupon yönetimi: liste, filtreleme, manuel iptal
- [ ] Ana sayfa yönetimi: section sıralaması, kampanya ataması
- [ ] Kampanya başvurularını görüntüle + durum güncelle
- [ ] İşletme hesabı oluşturma (admin tarafından)

**Genel İyileştirmeler:**
- [ ] Firestore Security Rules v2 (tüm kurallar gözden geçirilir)
- [ ] Performans: lazy import, code splitting, görsel optimizasyon
- [ ] SEO: slug bazlı URL'ler, meta description, Open Graph
- [ ] Hata yönetimi: global error boundary, Cloud Function hata loglama
- [ ] Temel rate limiting (Cloud Functions)

---

## MVP Kapsamı Özeti

| Özellik | Milestone |
|---|---|
| Kullanıcı kayıt / giriş | M1 |
| Ana sayfa & kampanya listeleme | M2 |
| Kampanya detay sayfası | M3 |
| Satın alma (iyzico entegrasyonu) | M3 |
| Kupon sistemi | M3 |
| Kullanıcı paneli | M3 |
| İşletme kupon doğrulama | M4 |
| Kampanya başvuru formu | M4 |
| Admin panel | M5 |
| SEO & performans & güvenlik | M5 |

---

## Tahmini Toplam Süre

| Milestone | Süre |
|---|---|
| M1 — Altyapı & Auth | 1.5 hafta |
| M2 — Ana Sayfa & Listeleme | 1 – 1.5 hafta |
| M3 — Detay & Ödeme & Kupon | 2 – 2.5 hafta |
| M4 — İşletme & Başvuru | 0.5 – 1 hafta |
| M5 — Admin & İyileştirmeler | 2 hafta |
| **Toplam** | **~7 – 8.5 hafta** |

---

## Gelecek Aşamalar (MVP Sonrası)

- 81 şehir desteği
- İşletmelere özel kupon yönetim paneli (onaylama / iptal)
- Admin panelinde işletme bazlı kampanya oluşturma
- Gelişmiş ana sayfa özelleştirme
- Favori sistemi, ekstra indirim mekanizmaları
- İşletmeler için ücretli reklam / öne çıkartma
- SSR (Remix veya Next.js) — büyük ölçek SEO gereksinimi durumunda
- Proje geneli SEO & içerik geliştirmeleri
