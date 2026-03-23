/**
 * Firestore başlangıç verilerini yükler: şehirler + kategoriler
 *
 * Kullanım:
 *   node scripts/seedFirestore.mjs
 *
 * Gereklilikler:
 *   - GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni Firebase Admin servis hesabına işaret etmeli
 *     VEYA Firebase emulator çalışıyor olmalı (FIRESTORE_EMULATOR_HOST=localhost:8080)
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

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
  { id: 'restoran',    name: 'Restoran',    slug: 'restoran',    icon: '🍽️',  order: 1 },
  { id: 'spa',         name: 'Spa & Masaj', slug: 'spa',         icon: '💆',  order: 2 },
  { id: 'eglence',     name: 'Eğlence',     slug: 'eglence',     icon: '🎭',  order: 3 },
  { id: 'spor',        name: 'Spor',        slug: 'spor',        icon: '🏋️',  order: 4 },
  { id: 'guzellik',    name: 'Güzellik',    slug: 'guzellik',    icon: '💅',  order: 5 },
  { id: 'seyahat',     name: 'Seyahat',     slug: 'seyahat',     icon: '✈️',  order: 6 },
  { id: 'egitim',      name: 'Eğitim',      slug: 'egitim',      icon: '📚',  order: 7 },
  { id: 'diger',       name: 'Diğer',       slug: 'diger',       icon: '🏷️',  order: 99 },
];

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

  await batch.commit();
  console.log(`✅ ${cities.length} şehir, ${categories.length} kategori yazıldı.`);
}

seed().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
