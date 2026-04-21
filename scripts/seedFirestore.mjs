/**
 * Firestore başlangıç verilerini yükler: şehirler, kategoriler,
 * örnek işletme ve örnek kampanyalar (geliştirme için).
 *
 * Kullanım:
 *   node scripts/seedFirestore.mjs
 *
 * Gereklilikler:
 *   - GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni Firebase Admin servis hesabına işaret etmeli
 *     VEYA Firebase emulator çalışıyor olmalı (FIRESTORE_EMULATOR_HOST=localhost:8080)
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

// ─── Şehirler ────────────────────────────────────────────────────────────────
const cities = [
  { id: 'bursa', name: 'Bursa', slug: 'bursa', isActive: true },
];

// ─── Kategoriler ─────────────────────────────────────────────────────────────
const categories = [
  { id: 'restoran',    name: 'Restoran',    slug: 'restoran',    icon: 'restaurant',        order: 1 },
  { id: 'spa',         name: 'Spa & Masaj', slug: 'spa',         icon: 'spa',               order: 2 },
  { id: 'eglence',     name: 'Eğlence',     slug: 'eglence',     icon: 'confirmation_number', order: 3 },
  { id: 'spor',        name: 'Spor',        slug: 'spor',        icon: 'fitness_center',    order: 4 },
  { id: 'guzellik',    name: 'Güzellik',    slug: 'guzellik',    icon: 'face_retouching_natural', order: 5 },
  { id: 'seyahat',     name: 'Seyahat',     slug: 'seyahat',     icon: 'flight_takeoff',    order: 6 },
  { id: 'egitim',      name: 'Eğitim',      slug: 'egitim',      icon: 'school',            order: 7 },
  { id: 'diger',       name: 'Diğer',       slug: 'diger',       icon: 'sell',              order: 99 },
];

// ─── Örnek İşletme (dev için) ────────────────────────────────────────────────
const demoBusinesses = [
  {
    id: 'demo-spa',
    name: 'Ethereal Sanctuary Spa',
    ownerId: 'demo-owner-uid',
    contactEmail: 'info@etherealsanctuary.com',
    phone: '+90 224 000 00 00',
    address: 'Heykel Mah. Atatürk Cd. No:1, Osmangazi / Bursa',
    cityId: 'bursa',
    isActive: true,
  },
  {
    id: 'demo-restaurant',
    name: 'Teras Bosphorus',
    ownerId: 'demo-owner-uid',
    contactEmail: 'info@terasbosphorus.com',
    phone: '+90 224 000 00 01',
    address: 'Çekirge Cd. No:12, Osmangazi / Bursa',
    cityId: 'bursa',
    isActive: true,
  },
];

// ─── Örnek Kampanyalar (dev için) ────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

const demoCampaigns = [
  {
    id: 'aromaterapi-kacis',
    title: 'Aromaterapi Kaçış Paketi',
    slug: 'aromaterapi-kacis-paketi',
    description:
      '90 dakikalık aromatik yağ masajı, özel buhar seansı ve bitki çayı ikramı. Haftanın yorgunluğunu atın, içsel dengenizi yeniden kurun.',
    businessId: 'demo-spa',
    cityId: 'bursa',
    categoryId: 'spa',
    price: 980,
    originalPrice: 1400,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBabKUWvZgRmuNzv2ERfn1a9wW8I1SjW03MMHHX6iNRPmsh1kuvlUcz9lmnYjWilETqxwxQJ4Gjue2-QtpMgZSm98JoKW6onQe7puApuJE8gIDhlUlajx0FeOQrXhCOsZ8-1ZPAmqm5zsnTd1ha2-PW1htZzs1_uL8RKjI7-wn1AV8QtT6DDc8A2dyU4FhBLEiT9fa-MjZZMJdzmOMWoZFOb2jRsjftCn6Sbuf13k5v3r0obGSwC0IMFgbjHJunDcJebGES9178-cQ',
    ],
    quota: 100,
    soldCount: 12,
    isActive: true,
    isFeatured: true,
    expiresAt: new Date(now + 14 * DAY),
  },
  {
    id: 'gelinlik-isilti',
    title: 'Gelinlik Işıltısı Programı',
    slug: 'gelinlik-isiltisi-programi',
    description:
      '4 haftalık cilt bakımı ve vücut polisajı programı. Özel gününüz için tam kapsamlı bir hazırlık deneyimi.',
    businessId: 'demo-spa',
    cityId: 'bursa',
    categoryId: 'guzellik',
    price: 3200,
    originalPrice: 4250,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDDWJ4hRq0TSARuLC5o0bZTRW8F_4HaOLCCPAEnsyqr6Muh7WRQnRsij0EsWYUU1lsbEaSjuuh1k-y-iy3CSVyAn94m4rsMEz2qyqGI1URl5xk9zH29vNqSd6z8tHU6fOFW3O8OSNnhKJCOLFcDeJufDLZ8JgLJzCaxmuEptEi-SsT9jj6px0iWus00XFVPAZ0SOpZPZJxBhFWLpL3WJvZLlP9G1NtNYdaiXiRHgSoQSETVLXQJr7GNpFtzdExVygJpDFIMj-AFdgs',
    ],
    quota: 50,
    soldCount: 5,
    isActive: true,
    isFeatured: true,
    expiresAt: new Date(now + 21 * DAY),
  },
  {
    id: 'sicak-tas-terapisi',
    title: 'Sıcak Taş Terapisi',
    slug: 'sicak-tas-terapisi',
    description:
      'Isıtılmış bazalt taşları ve botanik yağlarıyla derin doku gevşemesi. 75 dakikalık bir ritüel.',
    businessId: 'demo-spa',
    cityId: 'bursa',
    categoryId: 'spa',
    price: 775,
    originalPrice: 1050,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAIeuke514OVHHTN5RPoahiVdsL8sAFMMrKsAHmL4A2kOw4tpajULDjKyXNi5fduUBLZtWOmeNaKo1TFWxUy7f-k_dAM1Hu-QfwZF0dkCbplX3x1sYy1zPoaDeQn89DcU3Qb_ySFq4pXtG9caprRBIYyeUIIzcE8IB19H-tW9GYoOBR5_YjEnHQCUo5PzWe4ra1t_iwlu_abFliiwJ58uykppiYsnaKKDU8YGa1Scs0bO-BG7bCXF6FrVINJ-P_Z54ACLjsceGBWGI',
    ],
    quota: 80,
    soldCount: 30,
    isActive: true,
    isFeatured: true,
    expiresAt: new Date(now + 10 * DAY),
  },
  {
    id: 'cicekli-banyo',
    title: 'Çiçekli Banyo Ritüeli',
    slug: 'cicekli-banyo-rituali',
    description:
      'Değerli yağlar eşliğinde 30 dakikalık banyo ve ardından minerallerle canlandırıcı masaj. Haftalık özel.',
    businessId: 'demo-spa',
    cityId: 'bursa',
    categoryId: 'spa',
    price: 600,
    originalPrice: 900,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB4opsxUB-GtC5HZpmxuZzpy7ehp9s14u92WIH4PPinbFbjJnJVQhMAy5kcno97vMwVh_LNXtjF59UsrqaDN05kI_hLEhXOoqhgYDG7NYG0JNwriApXi4m78EGh4L3Qv7ur8rhvdXi5Z5WtmaeKiJ_WwBPm-qqyChK0BW6SgKFaKuSEfNjdEvIt6T9gH6zFtEn4eUsAlXQm32MiujctG5O3MQwdo74ZrtIaigWu7E7RlcJDurq3nNq_Oz2G0a06wIlccgqTuUaGfoE',
    ],
    quota: 40,
    soldCount: 22,
    isActive: true,
    isFeatured: false,
    expiresAt: new Date(now + 3 * DAY),
  },
  {
    id: 'bosphorus-aksam',
    title: 'Boğaz Manzaralı Akşam Yemeği',
    slug: 'bogaz-manzarali-aksam-yemegi-2-kisilik',
    description:
      '2 kişilik set menü: giriş, ana yemek, tatlı ve bir şişe ev şarabı. Canlı müzik eşliğinde.',
    businessId: 'demo-restaurant',
    cityId: 'bursa',
    categoryId: 'restoran',
    price: 1450,
    originalPrice: 2000,
    images: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80',
    ],
    quota: 60,
    soldCount: 18,
    isActive: true,
    isFeatured: true,
    expiresAt: new Date(now + 30 * DAY),
  },
  {
    id: 'fitness-aylik',
    title: 'Aylık Sınırsız Fitness Üyeliği',
    slug: 'aylik-sinirsiz-fitness-uyeligi',
    description:
      'Premium fitness kulübünde 30 günlük sınırsız giriş. Kardiyo, ağırlık, grup dersleri dahil.',
    businessId: 'demo-restaurant',
    cityId: 'bursa',
    categoryId: 'spor',
    price: 699,
    originalPrice: 1200,
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    ],
    quota: 0,
    soldCount: 45,
    isActive: true,
    isFeatured: false,
    expiresAt: new Date(now + 45 * DAY),
  },
];

// ─── Seed akışı ──────────────────────────────────────────────────────────────
async function seed() {
  const batch = db.batch();

  for (const city of cities) {
    const { id, ...data } = city;
    batch.set(db.collection('cities').doc(id), data, { merge: true });
  }

  for (const cat of categories) {
    const { id, ...data } = cat;
    batch.set(db.collection('categories').doc(id), data, { merge: true });
  }

  for (const biz of demoBusinesses) {
    const { id, ...data } = biz;
    batch.set(
      db.collection('businesses').doc(id),
      { ...data, createdAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }

  for (const camp of demoCampaigns) {
    const { id, expiresAt, ...rest } = camp;
    batch.set(
      db.collection('campaigns').doc(id),
      {
        ...rest,
        expiresAt: Timestamp.fromDate(expiresAt),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  await batch.commit();
  console.log(
    `✅ Seed tamam: ${cities.length} şehir, ${categories.length} kategori, ` +
    `${demoBusinesses.length} işletme, ${demoCampaigns.length} kampanya`
  );
}

seed().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
