/**
 * Firestore başlangıç verileri:
 *   - şehirler (6 büyük şehir, hepsi aktif)
 *   - kategoriler (11)
 *   - örnek işletmeler
 *   - örnek kampanyalar (~24 adet, farklı şehir ve kategorilerde)
 *
 * Kullanım:
 *   node scripts/seedFirestore.mjs
 *
 * Gereklilikler:
 *   - GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni Firebase Admin servis hesabına işaret etmeli
 */

import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) initializeApp();

const db = getFirestore();

// ─── Şehirler ────────────────────────────────────────────────────────────────
const cities = [
  { id: 'bursa', name: 'Bursa', slug: 'bursa', isActive: true, order: 1 },
  { id: 'istanbul', name: 'İstanbul', slug: 'istanbul', isActive: true, order: 2 },
  { id: 'ankara', name: 'Ankara', slug: 'ankara', isActive: true, order: 3 },
  { id: 'izmir', name: 'İzmir', slug: 'izmir', isActive: true, order: 4 },
  { id: 'antalya', name: 'Antalya', slug: 'antalya', isActive: true, order: 5 },
  { id: 'eskisehir', name: 'Eskişehir', slug: 'eskisehir', isActive: true, order: 6 },
];

// ─── Kategoriler ─────────────────────────────────────────────────────────────
const categories = [
  { id: 'restoran', name: 'Restoran & Kafe', slug: 'restoran', icon: 'restaurant', order: 1 },
  { id: 'guzellik', name: 'Güzellik & Bakım', slug: 'guzellik', icon: 'spa', order: 2 },
  { id: 'seyahat', name: 'Seyahat & Otel', slug: 'seyahat', icon: 'luggage', order: 3 },
  { id: 'wellness', name: 'Sağlık & Wellness', slug: 'wellness', icon: 'self_care', order: 4 },
  { id: 'eglence', name: 'Eğlence & Aktivite', slug: 'eglence', icon: 'theater_comedy', order: 5 },
  { id: 'spor', name: 'Spor & Fitness', slug: 'spor', icon: 'fitness_center', order: 6 },
  { id: 'egitim', name: 'Eğitim & Kurs', slug: 'egitim', icon: 'school', order: 7 },
  { id: 'alisveris', name: 'Alışveriş', slug: 'alisveris', icon: 'shopping_bag', order: 8 },
  { id: 'otomotiv', name: 'Otomotiv', slug: 'otomotiv', icon: 'directions_car', order: 9 },
  { id: 'evcil', name: 'Evcil Hayvan', slug: 'evcil', icon: 'pets', order: 10 },
  { id: 'diger', name: 'Diğer', slug: 'diger', icon: 'sell', order: 99 },
];

// ─── Örnek İşletmeler ────────────────────────────────────────────────────────
const demoBusinesses = [
  { id: 'ethereal-spa', name: 'Ethereal Sanctuary Spa', cityId: 'bursa', district: 'Nilüfer', address: 'Nilüfer Kent Meydanı No:4' },
  { id: 'bahce-cafe', name: 'Bahçe Cafe & Restaurant', cityId: 'bursa', district: 'Osmangazi', address: 'Heykel Mah. Atatürk Cd. No:1' },
  { id: 'beef-house', name: 'Beef House Grill', cityId: 'bursa', district: 'Nilüfer', address: 'İhsaniye Mah. FSM Bulvarı No:8' },
  { id: 'sakura-sushi', name: 'Sakura Sushi Bar', cityId: 'bursa', district: 'Mudanya', address: 'Güzelyalı Mah. Sahil Cd. No:21' },
  { id: 'la-bella', name: 'La Bella Pizzeria', cityId: 'bursa', district: 'Yıldırım', address: 'Millet Cd. No:56' },
  { id: 'lumen-beauty', name: 'Lumen Beauty Clinic', cityId: 'bursa', district: 'Nilüfer', address: 'Konak Mah. Merkez Cd. No:12' },
  { id: 'elan-kuafor', name: 'Élan Kuaför & Studio', cityId: 'bursa', district: 'Osmangazi', address: 'Çekirge Cd. No:47' },
  { id: 'uludag-termal', name: 'Uludağ Termal Resort', cityId: 'bursa', district: 'Osmangazi', address: 'Uludağ Yolu 12. Km' },
  { id: 'cihangir-bistro', name: 'Cihangir Bistro', cityId: 'istanbul', district: 'Beyoğlu', address: 'Sıraselviler Cd. No:33' },
  { id: 'kadikoy-dok', name: 'Dok Balık & Mezze', cityId: 'istanbul', district: 'Kadıköy', address: 'Moda Cd. No:88' },
  { id: 'nisantasi-skin', name: 'Nişantaşı Skin Clinic', cityId: 'istanbul', district: 'Şişli', address: 'Teşvikiye Cd. No:102' },
  { id: 'bosphorus-hotel', name: 'Bosphorus Palace Hotel', cityId: 'istanbul', district: 'Beşiktaş', address: 'Yıldız Cd. No:4' },
  { id: 'cankaya-steak', name: 'Çankaya Steakhouse', cityId: 'ankara', district: 'Çankaya', address: 'Tunalı Hilmi Cd. No:66' },
  { id: 'ankara-spa-mavi', name: 'Mavi Wellness Spa', cityId: 'ankara', district: 'Çankaya', address: 'Kavaklıdere Cilingir Sok. No:3' },
  { id: 'alsancak-kahve', name: 'Alsancak Coffee House', cityId: 'izmir', district: 'Konak', address: 'Kıbrıs Şehitleri Cd. No:41' },
  { id: 'cesme-resort', name: 'Çeşme Beach Resort', cityId: 'izmir', district: 'Çeşme', address: 'Ilıca Sahili No:1' },
  { id: 'izmir-yoga', name: 'Asana Yoga & Pilates', cityId: 'izmir', district: 'Karşıyaka', address: 'Bostanlı Mah. No:14' },
  { id: 'lara-beach', name: 'Lara Beach Resort & Spa', cityId: 'antalya', district: 'Muratpaşa', address: 'Lara Turizm Alanı' },
  { id: 'kaleici-meyhane', name: 'Kaleiçi Meyhanesi', cityId: 'antalya', district: 'Muratpaşa', address: 'Kaleiçi Hıdırlık Sok. No:7' },
  { id: 'antalya-fitness', name: 'Core Fitness Club', cityId: 'antalya', district: 'Konyaaltı', address: 'Hurma Mah. Konyaaltı Cd.' },
  { id: 'odunpazari-cafe', name: 'Odunpazarı Köşkü', cityId: 'eskisehir', district: 'Odunpazarı', address: 'Atlıhan Sok. No:19' },
  { id: 'eski-wellness', name: 'Termal Wellness Center', cityId: 'eskisehir', district: 'Tepebaşı', address: 'Hamamyolu Sk. No:3' },
];

// ─── Kampanyalar (~24) ───────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

// Unsplash seed görselleri (hızlı, lazy load uyumlu)
const IMG = (id, seed) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80${seed ? `&sig=${seed}` : ''}`;

const demoCampaigns = [
  // ── Bursa — Spa & Wellness ───────────────────────────────────────
  {
    id: 'aromaterapi-kacis',
    title: 'Aromaterapi Kaçış Paketi',
    description: '90 dakikalık aromatik yağ masajı, özel buhar seansı ve bitki çayı ikramı. Haftanın yorgunluğunu atın.',
    businessId: 'ethereal-spa',
    businessName: 'Ethereal Sanctuary Spa',
    cityId: 'bursa',
    district: 'Nilüfer',
    categoryId: 'wellness',
    price: 980, originalPrice: 1400, rating: 4.9,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBabKUWvZgRmuNzv2ERfn1a9wW8I1SjW03MMHHX6iNRPmsh1kuvlUcz9lmnYjWilETqxwxQJ4Gjue2-QtpMgZSm98JoKW6onQe7puApuJE8gIDhlUlajx0FeOQrXhCOsZ8-1ZPAmqm5zsnTd1ha2-PW1htZzs1_uL8RKjI7-wn1AV8QtT6DDc8A2dyU4FhBLEiT9fa-MjZZMJdzmOMWoZFOb2jRsjftCn6Sbuf13k5v3r0obGSwC0IMFgbjHJunDcJebGES9178-cQ'],
    quota: 100, soldCount: 12, isFeatured: true, daysLeft: 14,
  },
  {
    id: 'sicak-tas-terapisi',
    title: 'Sıcak Taş Terapisi',
    description: 'Isıtılmış bazalt taşları ve botanik yağlarıyla derin doku gevşemesi. 75 dakikalık ritüel.',
    businessId: 'ethereal-spa',
    businessName: 'Ethereal Sanctuary Spa',
    cityId: 'bursa',
    district: 'Nilüfer',
    categoryId: 'wellness',
    price: 775, originalPrice: 1050, rating: 4.8,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAIeuke514OVHHTN5RPoahiVdsL8sAFMMrKsAHmL4A2kOw4tpajULDjKyXNi5fduUBLZtWOmeNaKo1TFWxUy7f-k_dAM1Hu-QfwZF0dkCbplX3x1sYy1zPoaDeQn89DcU3Qb_ySFq4pXtG9caprRBIYyeUIIzcE8IB19H-tW9GYoOBR5_YjEnHQCUo5PzWe4ra1t_iwlu_abFliiwJ58uykppiYsnaKKDU8YGa1Scs0bO-BG7bCXF6FrVINJ-P_Z54ACLjsceGBWGI'],
    quota: 80, soldCount: 30, isFeatured: true, daysLeft: 10,
  },
  {
    id: 'gelinlik-isilti',
    title: 'Gelinlik Işıltısı Programı',
    description: '4 haftalık cilt bakımı ve vücut polisajı programı. Özel gününüz için tam kapsamlı hazırlık.',
    businessId: 'lumen-beauty',
    businessName: 'Lumen Beauty Clinic',
    cityId: 'bursa',
    district: 'Nilüfer',
    categoryId: 'guzellik',
    price: 3200, originalPrice: 4250, rating: 4.9,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDDWJ4hRq0TSARuLC5o0bZTRW8F_4HaOLCCPAEnsyqr6Muh7WRQnRsij0EsWYUU1lsbEaSjuuh1k-y-iy3CSVyAn94m4rsMEz2qyqGI1URl5xk9zH29vNqSd6z8tHU6fOFW3O8OSNnhKJCOLFcDeJufDLZ8JgLJzCaxmuEptEi-SsT9jj6px0iWus00XFVPAZ0SOpZPZJxBhFWLpL3WJvZLlP9G1NtNYdaiXiRHgSoQSETVLXQJr7GNpFtzdExVygJpDFIMj-AFdgs'],
    quota: 50, soldCount: 5, isFeatured: true, daysLeft: 21,
  },
  {
    id: 'cicekli-banyo',
    title: 'Çiçekli Banyo Ritüeli',
    description: 'Değerli yağlar eşliğinde 30 dakikalık banyo ve ardından minerallerle canlandırıcı masaj.',
    businessId: 'ethereal-spa',
    businessName: 'Ethereal Sanctuary Spa',
    cityId: 'bursa',
    district: 'Nilüfer',
    categoryId: 'wellness',
    price: 600, originalPrice: 900, rating: 4.7,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB4opsxUB-GtC5HZpmxuZzpy7ehp9s14u92WIH4PPinbFbjJnJVQhMAy5kcno97vMwVh_LNXtjF59UsrqaDN05kI_hLEhXOoqhgYDG7NYG0JNwriApXi4m78EGh4L3Qv7ur8rhvdXi5Z5WtmaeKiJ_WwBPm-qqyChK0BW6SgKFaKuSEfNjdEvIt6T9gH6zFtEn4eUsAlXQm32MiujctG5O3MQwdo74ZrtIaigWu7E7RlcJDurq3nNq_Oz2G0a06wIlccgqTuUaGfoE'],
    quota: 40, soldCount: 22, isFeatured: false, daysLeft: 3,
  },
  // ── Bursa — Restoran ─────────────────────────────────────────────
  {
    id: 'serpme-kahvalti',
    title: 'Serpme Köy Kahvaltısı (2 Kişi)',
    description: 'Yöresel lezzetlerle hazırlanmış sınırsız serpme kahvaltı. Ev yapımı reçel ve kaymak dahil.',
    businessId: 'bahce-cafe',
    businessName: 'Bahçe Cafe & Restaurant',
    cityId: 'bursa', district: 'Osmangazi', categoryId: 'restoran',
    price: 429, originalPrice: 780, rating: 4.8,
    images: [IMG('photo-1533089860892-a7c6f0a88666', 1)],
    quota: 100, soldCount: 43, isFeatured: false, daysLeft: 20,
  },
  {
    id: 'steak-menu',
    title: 'Premium Steak Menüsü (2 Kişi)',
    description: 'Dry-age biftek, şef özel sosları ve ev yapımı tatlı içeren 4 kap menü.',
    businessId: 'beef-house',
    businessName: 'Beef House Grill',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'restoran',
    price: 1680, originalPrice: 2400, rating: 4.9,
    images: [IMG('photo-1544025162-d76694265947', 2)],
    quota: 60, soldCount: 18, isFeatured: true, daysLeft: 30,
  },
  {
    id: 'sushi-set',
    title: '32 Parça Karışık Sushi Seti',
    description: 'Uzakdoğu lezzetleri: nigiri, maki, uramaki ve özel şef seçkisi.',
    businessId: 'sakura-sushi',
    businessName: 'Sakura Sushi Bar',
    cityId: 'bursa', district: 'Mudanya', categoryId: 'restoran',
    price: 550, originalPrice: 1100, rating: 4.7,
    images: [IMG('photo-1579871494447-9811cf80d66c', 3)],
    quota: 80, soldCount: 25, isFeatured: false, daysLeft: 7,
  },
  {
    id: 'italyan-pizza',
    title: 'İtalyan Pizza + İçecek Menü',
    description: 'Taş fırında pişmiş orijinal İtalyan pizza ve ev yapımı limonata.',
    businessId: 'la-bella',
    businessName: 'La Bella Pizzeria',
    cityId: 'bursa', district: 'Yıldırım', categoryId: 'restoran',
    price: 315, originalPrice: 420, rating: 4.6,
    images: [IMG('photo-1513104890138-7c749659a591', 4)],
    quota: 200, soldCount: 87, isFeatured: false, daysLeft: 14,
  },
  // ── Bursa — Güzellik ─────────────────────────────────────────────
  {
    id: 'hydrafacial',
    title: 'Hydrafacial Cilt Bakımı',
    description: '3 aşamalı cilt bakımı: derin temizlik, ekstraksiyon ve serum uygulaması.',
    businessId: 'lumen-beauty',
    businessName: 'Lumen Beauty Clinic',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'guzellik',
    price: 810, originalPrice: 1800, rating: 4.9,
    images: [IMG('photo-1570172619644-dfd03ed5d881', 5)],
    quota: 50, soldCount: 14, isFeatured: false, daysLeft: 15,
  },
  {
    id: 'keratin-bakim',
    title: 'Keratin Bakım + Fön Paketi',
    description: 'Saçlarınıza profesyonel keratin bakımı ve şekillendirme.',
    businessId: 'elan-kuafor',
    businessName: 'Élan Kuaför & Studio',
    cityId: 'bursa', district: 'Osmangazi', categoryId: 'guzellik',
    price: 900, originalPrice: 1500, rating: 4.8,
    images: [IMG('photo-1560066984-138dadb4c035', 6)],
    quota: 80, soldCount: 33, isFeatured: false, daysLeft: 25,
  },
  // ── Bursa — Seyahat ──────────────────────────────────────────────
  {
    id: 'uludag-termal-kacamak',
    title: 'Uludağ Termal Kaçamağı (2 Gece)',
    description: '2 kişilik termal süit, yarım pansiyon ve spa kullanımı dahil.',
    businessId: 'uludag-termal',
    businessName: 'Uludağ Termal Resort',
    cityId: 'bursa', district: 'Osmangazi', categoryId: 'seyahat',
    price: 3025, originalPrice: 4200, rating: 4.7,
    images: [IMG('photo-1566073771259-6a8506099945', 7)],
    quota: 40, soldCount: 11, isFeatured: true, daysLeft: 45,
  },
  // ── İstanbul ─────────────────────────────────────────────────────
  {
    id: 'cihangir-brunch',
    title: 'Boğaz Manzaralı Akşam Yemeği',
    description: '2 kişilik set menü: giriş, ana yemek, tatlı ve bir şişe ev şarabı. Canlı müzik eşliğinde.',
    businessId: 'cihangir-bistro',
    businessName: 'Cihangir Bistro',
    cityId: 'istanbul', district: 'Beyoğlu', categoryId: 'restoran',
    price: 1450, originalPrice: 2000, rating: 4.8,
    images: [IMG('photo-1514933651103-005eec06c04b', 8)],
    quota: 80, soldCount: 37, isFeatured: true, daysLeft: 30,
  },
  {
    id: 'kadikoy-balik',
    title: 'Kadıköy Balık & Mezze Ziyafeti (2 Kişi)',
    description: 'Günlük taze balık, 8 çeşit meze ve ev yapımı rakı servisi.',
    businessId: 'kadikoy-dok',
    businessName: 'Dok Balık & Mezze',
    cityId: 'istanbul', district: 'Kadıköy', categoryId: 'restoran',
    price: 1280, originalPrice: 1900, rating: 4.7,
    images: [IMG('photo-1467003909585-2f8a72700288', 9)],
    quota: 60, soldCount: 22, isFeatured: false, daysLeft: 20,
  },
  {
    id: 'nisantasi-skin',
    title: 'Lazer Epilasyon Paketi (5 Seans)',
    description: 'FDA onaylı cihazlarla tam vücut lazer epilasyon. 5 seansı kapsar.',
    businessId: 'nisantasi-skin',
    businessName: 'Nişantaşı Skin Clinic',
    cityId: 'istanbul', district: 'Şişli', categoryId: 'guzellik',
    price: 4800, originalPrice: 9600, rating: 4.9,
    images: [IMG('photo-1596462502278-27bfdc403348', 10)],
    quota: 30, soldCount: 9, isFeatured: true, daysLeft: 60,
  },
  {
    id: 'bosphorus-hotel',
    title: 'Boğaz Manzaralı 1 Gece Konaklama',
    description: '5 yıldızlı otelde 1 gece, Boğaz manzaralı oda, kahvaltı dahil.',
    businessId: 'bosphorus-hotel',
    businessName: 'Bosphorus Palace Hotel',
    cityId: 'istanbul', district: 'Beşiktaş', categoryId: 'seyahat',
    price: 3400, originalPrice: 5200, rating: 4.8,
    images: [IMG('photo-1551882547-ff40c63fe5fa', 11)],
    quota: 50, soldCount: 14, isFeatured: true, daysLeft: 40,
  },
  // ── Ankara ───────────────────────────────────────────────────────
  {
    id: 'cankaya-steak',
    title: 'Çankaya Steakhouse Menü (2 Kişi)',
    description: 'Kuru dinlendirilmiş T-bone, özel soslu garnitür ve tatlı dahil 3 kap.',
    businessId: 'cankaya-steak',
    businessName: 'Çankaya Steakhouse',
    cityId: 'ankara', district: 'Çankaya', categoryId: 'restoran',
    price: 1550, originalPrice: 2300, rating: 4.7,
    images: [IMG('photo-1551183053-bf91a1d81141', 12)],
    quota: 60, soldCount: 19, isFeatured: false, daysLeft: 25,
  },
  {
    id: 'mavi-spa',
    title: 'Hamam + Köpük + Masaj Paketi',
    description: 'Geleneksel Türk hamamı deneyimi ile 45 dakika aromaterapi masajı.',
    businessId: 'ankara-spa-mavi',
    businessName: 'Mavi Wellness Spa',
    cityId: 'ankara', district: 'Çankaya', categoryId: 'wellness',
    price: 720, originalPrice: 1200, rating: 4.8,
    images: [IMG('photo-1540555700478-4be289fbecef', 13)],
    quota: 70, soldCount: 28, isFeatured: true, daysLeft: 18,
  },
  // ── İzmir ────────────────────────────────────────────────────────
  {
    id: 'alsancak-kahvalti',
    title: 'Ege Usulü Kahvaltı Tabağı',
    description: 'Ege otları, zeytinyağlılar ve ev yapımı börekler eşliğinde zengin kahvaltı.',
    businessId: 'alsancak-kahve',
    businessName: 'Alsancak Coffee House',
    cityId: 'izmir', district: 'Konak', categoryId: 'restoran',
    price: 350, originalPrice: 550, rating: 4.6,
    images: [IMG('photo-1493770348161-369560ae357d', 14)],
    quota: 150, soldCount: 72, isFeatured: false, daysLeft: 30,
  },
  {
    id: 'cesme-resort',
    title: 'Çeşme Resort 2 Gece Full Pansiyon',
    description: 'Denize sıfır 5 yıldızlı resortta 2 kişilik tam pansiyon konaklama.',
    businessId: 'cesme-resort',
    businessName: 'Çeşme Beach Resort',
    cityId: 'izmir', district: 'Çeşme', categoryId: 'seyahat',
    price: 6800, originalPrice: 10500, rating: 4.9,
    images: [IMG('photo-1520250497591-112f2f40a3f4', 15)],
    quota: 40, soldCount: 11, isFeatured: true, daysLeft: 50,
  },
  {
    id: 'asana-yoga',
    title: 'Aylık Sınırsız Yoga & Pilates',
    description: 'Tüm grup derslerine 30 gün sınırsız katılım + 1 özel seans.',
    businessId: 'izmir-yoga',
    businessName: 'Asana Yoga & Pilates',
    cityId: 'izmir', district: 'Karşıyaka', categoryId: 'spor',
    price: 890, originalPrice: 1600, rating: 4.8,
    images: [IMG('photo-1544367567-0f2fcb009e0b', 16)],
    quota: 50, soldCount: 19, isFeatured: false, daysLeft: 22,
  },
  // ── Antalya ──────────────────────────────────────────────────────
  {
    id: 'lara-beach-paket',
    title: 'Lara Beach Ultra Her Şey Dahil (3 Gün)',
    description: 'Deniz manzaralı oda, ultra her şey dahil konsept, spa kredisi.',
    businessId: 'lara-beach',
    businessName: 'Lara Beach Resort & Spa',
    cityId: 'antalya', district: 'Muratpaşa', categoryId: 'seyahat',
    price: 9800, originalPrice: 15000, rating: 4.9,
    images: [IMG('photo-1520250497591-112f2f40a3f4', 17)],
    quota: 30, soldCount: 8, isFeatured: true, daysLeft: 60,
  },
  {
    id: 'kaleici-meyhane',
    title: 'Kaleiçi Meyhanesi Akşam Yemeği',
    description: 'Tarihi Kaleiçi\'nde 2 kişilik geleneksel meze ziyafeti.',
    businessId: 'kaleici-meyhane',
    businessName: 'Kaleiçi Meyhanesi',
    cityId: 'antalya', district: 'Muratpaşa', categoryId: 'restoran',
    price: 890, originalPrice: 1350, rating: 4.7,
    images: [IMG('photo-1555396273-367ea4eb4db5', 18)],
    quota: 80, soldCount: 24, isFeatured: false, daysLeft: 30,
  },
  {
    id: 'core-fitness',
    title: 'Aylık Sınırsız Fitness Üyeliği',
    description: 'Premium fitness kulübünde 30 gün sınırsız giriş + 2 PT seansı.',
    businessId: 'antalya-fitness',
    businessName: 'Core Fitness Club',
    cityId: 'antalya', district: 'Konyaaltı', categoryId: 'spor',
    price: 699, originalPrice: 1200, rating: 4.6,
    images: [IMG('photo-1534438327276-14e5300c3a48', 19)],
    quota: 0, soldCount: 45, isFeatured: false, daysLeft: 45,
  },
  // ── Eskişehir ────────────────────────────────────────────────────
  {
    id: 'odunpazari-kahvalti',
    title: 'Odunpazarı Köşkü Kahvaltısı',
    description: 'Tarihi konakta 2 kişilik zengin Eskişehir kahvaltısı, çilbirli çay eşliğinde.',
    businessId: 'odunpazari-cafe',
    businessName: 'Odunpazarı Köşkü',
    cityId: 'eskisehir', district: 'Odunpazarı', categoryId: 'restoran',
    price: 380, originalPrice: 600, rating: 4.7,
    images: [IMG('photo-1482049016688-2d3e1b311543', 20)],
    quota: 100, soldCount: 38, isFeatured: false, daysLeft: 18,
  },
  {
    id: 'eski-termal',
    title: 'Termal Spa + Masaj Günü',
    description: 'Eskişehir termal sularında tam gün kullanım + 60 dk klasik masaj.',
    businessId: 'eski-wellness',
    businessName: 'Termal Wellness Center',
    cityId: 'eskisehir', district: 'Tepebaşı', categoryId: 'wellness',
    price: 520, originalPrice: 850, rating: 4.8,
    images: [IMG('photo-1540555700478-4be289fbecef', 21)],
    quota: 120, soldCount: 41, isFeatured: true, daysLeft: 35,
  },
];

// ─── Zengin içerik varsayılanları (kategori bazlı) ──────────────────────────
const CONTENT_BY_CATEGORY = {
  restoran: {
    highlights: [
      'Rezervasyonlu masa servisi',
      'Taze günlük malzemeler',
      'Ücretsiz ikram & su',
    ],
    included: ['Menüde belirtilen tüm öğeler', 'Servis ücreti'],
    notIncluded: ['Alkollü içecekler (menüde belirtilmediyse)', 'Bahşiş'],
    howToUse: [
      'Satın aldıktan sonra kuponunuz panelinize düşer.',
      'İşletmeyi arayarak rezervasyon yaptırın, tarih/saat belirleyin.',
      'Geldiğinizde kupon kodunuzu garsonunuza gösterin.',
      'Keyfinize bakın!',
    ],
    terms:
      '• Kupon tek seferde kullanılır.\n' +
      '• Rezervasyonsuz gelişlerde masa garantisi verilmez.\n' +
      '• Hafta sonu & özel günlerde (14 Şubat, yılbaşı) geçerli değildir.\n' +
      '• Menüdeki ek siparişler ücrete tabidir.',
    faq: [
      {
        question: 'Rezervasyon yapmadan gidebilir miyim?',
        answer:
          'Masa garantisi için rezervasyon tavsiye edilir; yoğun zamanlarda sırada bekleme olabilir.',
      },
      {
        question: 'Kuponumun geçerliliği ne kadar?',
        answer: 'Kampanya son kullanım tarihine kadar geçerlidir.',
      },
      {
        question: 'Hafta sonu kullanabilir miyim?',
        answer:
          'Normal hafta sonları geçerlidir; resmi bayram ve özel günlerde geçerli değildir.',
      },
    ],
  },
  wellness: {
    highlights: [
      'Hijyen standartlarında uzman ekip',
      'Kişiye özel bakım seansı',
      'Sonrasında bitki çayı ikramı',
    ],
    included: ['Havlu ve bornoz', 'Duş kullanımı', 'Terlik'],
    notIncluded: ['Kişisel bakım ürünleri', 'Ekstra masaj süresi'],
    howToUse: [
      'Kupon kodunuzu alın.',
      'Telefon veya WhatsApp ile randevu oluşturun.',
      'Randevudan 24 saat önce onay alın.',
      'İşletmeye giderken kimliğinizi ve kuponu yanınızda bulundurun.',
    ],
    terms:
      '• Randevu sistemiyle çalışır, doldurulmuş saatlere yeni rezervasyon alınmaz.\n' +
      '• Randevu iptali 12 saat öncesinden yapılmalıdır; aksi halde kupon kullanılmış sayılır.\n' +
      '• Kampanya tek kişi içindir, devredilemez.',
    faq: [
      {
        question: 'Hamile veya sağlık problemim varsa kullanabilir miyim?',
        answer:
          'Lütfen randevu öncesi bilgi verin; uzmanımız uygun olup olmadığını değerlendirecektir.',
      },
      {
        question: 'Randevumu değiştirebilir miyim?',
        answer:
          'Evet, 12 saat öncesinden haber vermeniz koşuluyla uygun bir tarihe alabiliriz.',
      },
    ],
  },
  guzellik: {
    highlights: [
      'FDA / CE onaylı cihazlar',
      'Uzman estetisyen eşliğinde',
      'Sonuç fotoğraflarıyla takip',
    ],
    included: ['Seans öncesi cilt analizi', 'Hijyen malzemeleri'],
    notIncluded: ['Evde bakım ürünleri'],
    howToUse: [
      'Kupon kodunuzu alın.',
      'Randevu için klinikle iletişime geçin.',
      'Kliniğe giderken kuponu gösterin.',
    ],
    terms:
      '• Kupon, sadece kampanyada belirtilen uygulama için geçerlidir.\n' +
      '• Seans değişikliği kliniğin uygun bulması halinde yapılabilir.\n' +
      '• 18 yaş altı için ebeveyn onayı gerekir.',
    faq: [
      {
        question: 'Kaç seansta sonuç görürüm?',
        answer:
          'Cilt tipine göre değişir; uzmanımız ilk seansta kişisel plan belirler.',
      },
    ],
  },
  seyahat: {
    highlights: [
      'Son dakika müsaitlik kontrolü kolay',
      'Ücretsiz park',
      'Kahvaltı dahil',
    ],
    included: ['Belirtilen konaklama süresi', 'Kahvaltı', 'Wi-Fi', 'Park'],
    notIncluded: ['Konaklama vergisi', 'Mini-bar', 'Ekstra gece'],
    howToUse: [
      'Kupon kodunuzu alın.',
      'Otelle iletişime geçerek müsait tarih belirleyin.',
      'Giriş sırasında kimliğinizi ve kuponunuzu resepsiyona gösterin.',
    ],
    terms:
      '• Müsaitlik durumuna göre rezervasyon yapılır.\n' +
      '• Resmi tatil ve bayramlarda ek fark çıkabilir.\n' +
      '• Erken ayrılışlarda iade yapılmaz.',
    faq: [
      {
        question: 'Evcil hayvan kabul ediyor musunuz?',
        answer: 'Lütfen otelle önceden iletişime geçin.',
      },
      {
        question: 'Ekstra gece eklemek istersem?',
        answer:
          'Otelin güncel tarifesi üzerinden aradaki farkı ödeyerek uzatabilirsiniz.',
      },
    ],
  },
  spor: {
    highlights: ['Sınırsız ders hakkı', 'Duş & dolap kullanımı', 'Uzman eğitmen'],
    included: ['Tüm grup derslerine katılım', 'Duş, dolap, havlu servisi'],
    notIncluded: ['Özel (PT) seanslar', 'Besin desteği ürünleri'],
    howToUse: [
      'Kupon kodunuzu alın.',
      'Tesise gidin ve resepsiyonda kodu gösterip üyelik kartınızı alın.',
      'Uygulamadan dersleri seçin.',
    ],
    terms: '• Üyelik başladıktan sonra dondurulamaz.\n• Misafir getirme yok.',
    faq: [
      {
        question: 'Üyelik hangi saatler arasında kullanılabilir?',
        answer: 'Tesisin çalışma saatleri dahilinde sınırsız giriş hakkınız vardır.',
      },
    ],
  },
  eglence: {
    highlights: ['Ailece uygun', 'Gün içi sınırsız kullanım', 'Güvenli oyun alanı'],
    included: ['Giriş bileti', 'Gün boyu sınırsız kullanım'],
    notIncluded: ['Yiyecek ve içecek'],
    howToUse: [
      'Kupon kodunuzu alın.',
      'Gişede gösterip bileklik alın.',
      'Keyfinize bakın.',
    ],
    terms: '• Hafta içi geçerlidir.\n• Resmi tatillerde geçerli değildir.',
    faq: [],
  },
  egitim: {
    highlights: ['Sertifika', 'Uzman eğitmen', 'Tekrar izleme hakkı'],
    included: ['Eğitim içeriği', 'Katılım sertifikası'],
    notIncluded: ['Ekstra materyal'],
    howToUse: [
      'Kupon kodunuzu alın.',
      'Eğitim kurumuyla iletişime geçin, başlangıç tarihi alın.',
    ],
    terms: '• Başlayan eğitim iade edilmez.',
    faq: [],
  },
};

const DEFAULT_CONTENT = {
  highlights: ['Hızlı kullanım', 'Güvenli ödeme', 'iyzico güvencesi'],
  included: ['Kampanyada belirtilen hizmet'],
  notIncluded: ['Ek siparişler'],
  howToUse: [
    'Kupon kodunuzu alın.',
    'İşletmeyle iletişime geçin.',
    'İşletmede kupon kodunuzu gösterin.',
  ],
  terms: '• Kupon tek seferde kullanılır.\n• Kampanya bitiş tarihine kadar geçerlidir.',
  faq: [],
};

const DEFAULT_CANCELLATION =
  'Satın aldıktan sonra 14 gün içinde ve kuponunuzu KULLANMAMIŞ olmanız şartıyla tam iade alabilirsiniz. Kullanılmış kuponlarda iade yapılamaz.';

// ─── Çoklu paketli özel kampanyalar ──────────────────────────────────────────
// Bu kampanyaların tek fiyat yerine birkaç paketi olur (demo görünümü zengin).
const MULTI_PACKAGES = {
  'aromaterapi-kacis': [
    {
      name: '1 Kişilik Klasik Seans',
      description: '60 dk aromatik yağ masajı + bitki çayı ikramı',
      price: 650,
      originalPrice: 950,
      quota: 60,
      soldCount: 8,
      isDefault: true,
    },
    {
      name: '1 Kişilik Tam Paket',
      description: '90 dk masaj + buhar seansı + bitki çayı',
      price: 980,
      originalPrice: 1400,
      quota: 40,
      soldCount: 3,
    },
    {
      name: '2 Kişilik Çift Paketi',
      description: '2 kişilik 90 dk masaj + buhar, aynı kabinde',
      price: 1750,
      originalPrice: 2700,
      quota: 20,
      soldCount: 1,
    },
  ],
  'steak-menu': [
    {
      name: '2 Kişilik Standart',
      description: 'Dry-age biftek + garnitür + tatlı',
      price: 1680,
      originalPrice: 2400,
      quota: 40,
      soldCount: 14,
      isDefault: true,
    },
    {
      name: '2 Kişilik + Şarap',
      description: 'Standart menü + 1 şişe ev şarabı',
      price: 2100,
      originalPrice: 3100,
      quota: 20,
      soldCount: 4,
    },
  ],
  'uludag-termal-kacamak': [
    {
      name: '2 Kişi - Standart Oda (2 Gece)',
      description: 'Yarım pansiyon + spa kullanımı',
      price: 3025,
      originalPrice: 4200,
      quota: 25,
      soldCount: 8,
      isDefault: true,
    },
    {
      name: '2 Kişi - Süit (2 Gece)',
      description: 'Süit oda + tam pansiyon + spa + masaj kredisi',
      price: 4200,
      originalPrice: 6200,
      quota: 15,
      soldCount: 3,
    },
  ],
  'lara-beach-paket': [
    {
      name: '2 Kişi - Standart Oda (3 Gün)',
      description: 'Ultra her şey dahil',
      price: 9800,
      originalPrice: 15000,
      quota: 20,
      soldCount: 5,
      isDefault: true,
    },
    {
      name: '2 Kişi - Deluxe (3 Gün)',
      description: 'Deniz manzaralı + spa kredisi 2500₺',
      price: 12500,
      originalPrice: 19500,
      quota: 10,
      soldCount: 3,
    },
  ],
  hydrafacial: [
    {
      name: 'Tek Seans Bakım',
      description: 'Temizlik + ekstraksiyon + serum',
      price: 810,
      originalPrice: 1800,
      quota: 30,
      soldCount: 9,
      isDefault: true,
    },
    {
      name: '3 Seans Paketi',
      description: 'Aylık düzenli bakım programı',
      price: 2200,
      originalPrice: 5400,
      quota: 20,
      soldCount: 5,
    },
    {
      name: '5 Seans Paketi',
      description: 'İntensif cilt yenileme programı',
      price: 3400,
      originalPrice: 9000,
      quota: 10,
      soldCount: 2,
    },
  ],
};

function makePackageId(campaignId, idx) {
  return `pkg-${campaignId}-${idx}`;
}

function buildPackages(c) {
  const multi = MULTI_PACKAGES[c.id];
  if (multi) {
    return multi.map((p, i) => ({
      id: makePackageId(c.id, i),
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice,
      quota: p.quota,
      soldCount: p.soldCount ?? 0,
      isDefault: !!p.isDefault || i === 0,
    }));
  }
  return [
    {
      id: makePackageId(c.id, 0),
      name: 'Standart',
      description: '',
      price: c.price,
      originalPrice: c.originalPrice,
      quota: c.quota ?? 0,
      soldCount: c.soldCount ?? 0,
      isDefault: true,
    },
  ];
}

function computeAggregates(packages) {
  const prices = packages.map((p) => Number(p.price) || 0);
  const originals = packages.map((p) => Number(p.originalPrice) || 0);
  return {
    minPrice: Math.min(...prices),
    maxOriginalPrice: Math.max(...originals),
    totalQuota: packages.reduce((s, p) => s + (Number(p.quota) || 0), 0),
    totalSold: packages.reduce((s, p) => s + (Number(p.soldCount) || 0), 0),
  };
}

function locationFor(business) {
  return {
    address: business?.address ?? '',
    district: business?.district ?? '',
    phone: business?.phone ?? '+90 224 000 00 00',
    workingHours: 'Pzt-Cmt 10:00-22:00 · Pazar 11:00-19:00',
    mapUrl: '',
  };
}

function enrichCampaign(c, businessesById) {
  const content = CONTENT_BY_CATEGORY[c.categoryId] ?? DEFAULT_CONTENT;
  const packages = buildPackages(c);
  const aggregates = computeAggregates(packages);
  const biz = businessesById[c.businessId];

  // Kısa açıklama: ilk cümle veya max 160 karakter
  const shortDesc =
    c.description.length <= 160
      ? c.description
      : c.description.split('.')[0] + '.';

  return {
    title: c.title,
    slug: c.id,
    shortDescription: shortDesc,
    description: c.description,

    businessId: c.businessId,
    businessName: c.businessName,
    cityId: c.cityId,
    district: c.district,
    categoryId: c.categoryId,
    rating: c.rating,
    images: c.images,

    packages,
    ...aggregates,

    highlights: content.highlights,
    included: content.included,
    notIncluded: content.notIncluded,
    howToUse: content.howToUse,
    terms: content.terms,
    faq: content.faq,
    cancellation: DEFAULT_CANCELLATION,

    location: locationFor(biz),
    paymentInfo: {
      maxInstallments: 9,
      installmentNote: '3 taksit komisyonsuz.',
    },

    isActive: true,
    isFeatured: !!c.isFeatured,
  };
}

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
      {
        ownerId: 'demo-owner-uid',
        isActive: true,
        contactEmail: `info@${id}.com`,
        phone: '+90 224 000 00 00',
        ...data,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  // İşletmeleri id → nesne eşlemesine çevir (konum alanı için)
  const businessesById = Object.fromEntries(
    demoBusinesses.map((b) => [b.id, b]),
  );

  for (const c of demoCampaigns) {
    const enriched = enrichCampaign(c, businessesById);
    batch.set(
      db.collection('campaigns').doc(c.id),
      {
        ...enriched,
        expiresAt: Timestamp.fromDate(new Date(now + c.daysLeft * DAY)),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  // ─── Homepage sections (Ana sayfa bölümleri) ──────────────────────────
  const homepageSections = [
    {
      id: 'one-cikanlar',
      title: 'Öne Çıkan Kampanyalar',
      slug: 'one-cikanlar',
      order: 0,
      isActive: true,
      campaignIds: demoCampaigns.filter((c) => c.isFeatured).slice(0, 6).map((c) => c.id),
    },
    {
      id: 'restoran-kafe',
      title: 'Restoran & Kafe Fırsatları',
      slug: 'restoran-kafe',
      order: 1,
      isActive: true,
      campaignIds: demoCampaigns.filter((c) => c.categoryId === 'restoran').slice(0, 6).map((c) => c.id),
    },
    {
      id: 'spa-wellness',
      title: 'Spa & Wellness',
      slug: 'spa-wellness',
      order: 2,
      isActive: true,
      campaignIds: demoCampaigns
        .filter((c) => c.categoryId === 'guzellik' || c.categoryId === 'wellness')
        .slice(0, 6)
        .map((c) => c.id),
    },
  ];

  for (const s of homepageSections) {
    const { id, ...data } = s;
    batch.set(
      db.collection('homepage_sections').doc(id),
      { ...data, createdAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
  }

  // ─── Kampanya başvuruları (demo) ──────────────────────────────────────
  const demoApplications = [
    {
      businessName: 'Vintage Barber Shop',
      campaignTitle: 'Klasik Tıraş + Sakal Bakımı %40 İndirim',
      description: 'Nilüfer merkezde butik berber salonumuz. Tıraş + sakal bakımı + yüz masajı paketi sunmak istiyoruz.',
      contactEmail: 'info@vintagebarber.com',
      contactPhone: '+90 532 000 10 20',
      status: 'pending',
    },
    {
      businessName: 'Yoga Loft Bursa',
      campaignTitle: '10 Seans Yoga Üyeliği',
      description: 'Odunpazarı benzeri loft stüdyomuzda sabah ve akşam dersleri için 10 seanslık indirimli paket.',
      contactEmail: 'hello@yogaloft.com',
      contactPhone: '+90 533 111 22 33',
      status: 'pending',
    },
    {
      businessName: 'Deniz Balık Restaurant',
      campaignTitle: '2 Kişilik Balık Menü Fırsatı',
      description: 'Mudanya sahilinde balık restoranı. 2 kişilik tam menü (meze + balık + tatlı) sunuyoruz.',
      contactEmail: 'rezervasyon@denizbalik.com',
      contactPhone: '+90 224 544 10 10',
      status: 'reviewed',
    },
    {
      businessName: 'Çınar Kahvaltı Evi',
      campaignTitle: 'Köy Kahvaltısı 2 Kişilik',
      description: 'Uludağ eteklerinde serpme köy kahvaltısı. Bahçeli alan ve taze ürünlerimizle.',
      contactEmail: 'cinar@kahvalti.com',
      contactPhone: '+90 224 777 88 99',
      status: 'approved',
    },
    {
      businessName: 'Funny Fun Park',
      campaignTitle: 'Çocuklar İçin Tam Gün Bilet',
      description: 'AVM içinde çocuk eğlence merkezi. Hafta içi tam gün sınırsız bilet için indirim yapabiliriz.',
      contactEmail: 'iletisim@funnyfunpark.com',
      contactPhone: '+90 224 222 33 44',
      status: 'pending',
    },
  ];

  for (const app of demoApplications) {
    const ref = db.collection('applications').doc();
    batch.set(ref, {
      ...app,
      createdAt: Timestamp.fromDate(
        new Date(now - Math.floor(Math.random() * 10) * DAY),
      ),
    });
  }

  await batch.commit();
  console.log(
    `✅ Seed tamam: ${cities.length} şehir, ${categories.length} kategori, ` +
    `${demoBusinesses.length} işletme, ${demoCampaigns.length} kampanya, ` +
    `${homepageSections.length} ana sayfa bölümü, ${demoApplications.length} başvuru`
  );
}

seed().catch((err) => {
  console.error('❌ Seed hatası:', err);
  process.exit(1);
});
