# GRP Kampanya Platformu

Bursa odaklı kampanya & kupon platformu. Vite + React + Firebase (Auth, Firestore, Functions, Storage, Hosting) + Tailwind v4.

## Kurulum

```bash
npm install
cd functions && npm install && cd ..
```

`.env.local` dosyasını `.env.example` üzerinden oluşturup Firebase config değerlerini girin.
Emülatörle çalışmak için `.env.local` içine `VITE_USE_EMULATORS=true` ekleyin.

> [!IMPORTANT]
> Eğer tarayıcı konsolunda `auth/invalid-api-key` hatası alıyorsanız, `.env.local` dosyanızın oluşturulduğundan ve içine geçerli API anahtarlarının girildiğinden emin olun.

## Geliştirme

```bash
# Vite dev sunucusu
npm run dev

# Firebase emülatörleri (ayrı terminal)
npm run emulators

# Firestore'a demo veriyi doldur (emülatör veya production)
npm run seed
```

## Demo Senaryosu (Patron Sunumu İçin)

Aşağıdaki akış tüm sistemi uçtan uca gösterir. Önce `npm run seed` çalıştırın.

### 1. Admin Panel Turu

1. **Giriş:** `/giris` → admin hesabı ile giriş
2. **`/admin`** — Dashboard: aktif kampanya sayısı, son 7 gün siparişleri, aktif kuponlar, bekleyen başvurular
3. **`/admin/kampanyalar`** — Kampanya listesi, filtre (aktif / pasif / öne çıkan), arama
4. **`/admin/kampanyalar/yeni`** — Yeni kampanya oluştur (görsel upload dahil), slug otomatik, zod validasyonu
5. **`/admin/siparisler`** — Tüm siparişler, durum filtresi, detay modal'ından manuel durum değiştirme
6. **`/admin/kuponlar`** — Tüm kuponlar, manuel iptal
7. **`/admin/basvurular`** — Kampanya başvuruları (onaylandı / reddedildi / incelendi)
8. **`/admin/ana-sayfa`** — Homepage section'ları: sıralama, kampanya ataması
9. **`/admin/kullanicilar`** — Kullanıcı listesi, rol atama (`setUserRole` Cloud Function)

### 2. Kullanıcı Akışı (Demo)

1. **`/`** — Ana sayfa, kampanya kartları
2. **`/kampanya/:slug`** — Detay sayfası → "Hemen Satın Al"
3. **`/odeme-sonucu`** — Ödeme sonucu ekranı (mock iyzico callback)
4. **`/hesabim/kuponlarim`** — Üretilen kupon kodları
5. **`/hesabim/siparislerim`** — Sipariş geçmişi

## Mimari

```
src/
├── features/
│   ├── admin/              # Admin paneli (CRUD, dashboard, homepage)
│   │   ├── AdminLayout.jsx
│   │   ├── components/     # Sidebar, DataTable, StatCard, PageHeader, ...
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── orders/
│   │   ├── coupons/
│   │   ├── applications/
│   │   ├── homepage/
│   │   └── users/
│   ├── auth/
│   ├── campaigns/          # Public kampanya sayfaları + hooks
│   ├── orders/             # Ödeme akışı
│   ├── user-panel/         # Profil, Kuponlarım, Siparişlerim
│   └── business/
├── lib/
│   ├── api/                # Cloud Function + Firestore API katmanı
│   ├── firebase.js
│   └── utils.js
├── router/
└── components/ui           # Button, Card, Modal, Badge, Spinner, IconSelect

functions/
└── src/
    ├── auth/setUserRole.js
    ├── orders/createOrder.js
    ├── payments/iyzicoWebhook.js
    ├── coupons/{generate,validate,use,cancel}Coupon.js
    └── emails/sendOrderEmail.js
```

### Backend Bağlantı Katmanı (`src/lib/api/`)

Frontend developer'ın kullanacağı soyutlama:

- `campaignsApi.getCampaignBySlug(slug)` — detay sayfası
- `ordersApi.createOrder({ campaignId, quantity })` — satın alma başlat
- `ordersApi.getUserOrders(userId)` — sipariş geçmişi
- `couponsApi.getUserCoupons(userId)` — kullanıcı kuponları
- `couponsApi.validateCoupon(code)` — işletme kupon doğrulama
- `couponsApi.useCoupon(code)` — işletme kupon kullanma
- `couponsApi.cancelCoupon(couponId, reason)` — admin manuel iptal

Hazır TanStack Query hook'ları:

- `useCampaignBySlug`, `useCreateOrder`, `useUserOrders`, `useUserCoupons`
- `useValidateCouponMutation`, `useUseCouponMutation`

## Backend Durumu

- `setUserRole` — **Tam çalışıyor**
- `createOrder` — **İskelet hazır**, iyzico entegrasyonu TODO (mock URL döner)
- `iyzicoWebhook` — **İskelet hazır**, imza doğrulama + gerçek payload TODO
- `validateCoupon`, `useCoupon`, `cancelCoupon` — **Tam çalışıyor**
- `generateCouponCode` — **Tam çalışıyor** (GRP-XXXXXX + çakışma kontrolü)
- `sendOrderEmail` — **İskelet hazır**, Resend entegrasyonu TODO

iyzico ve Resend entegrasyonları, ilgili `TODO(backend)` yorumlarında belirtilen noktalarda devreye alınacak.

## Deploy

```bash
# Firestore rules + indexes
firebase deploy --only firestore

# Cloud Functions
firebase deploy --only functions

# Frontend
npm run build && firebase deploy --only hosting
```

> [!TIP]
> Güvenlik kurallarındaki (`firestore.rules`) değişikliklerin projenizde aktif olması için konsolunuzda aşağıdaki komutu çalıştırarak rules'u deploy etmeniz faydalı olacaktır:
> ```bash
> firebase deploy --only firestore:rules
> ```
