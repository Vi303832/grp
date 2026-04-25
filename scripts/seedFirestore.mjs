/**
 * Firestore başlangıç verileri:
 *   - şehirler (6 büyük şehir, hepsi aktif)
 *   - kategoriler (11)
 *   - örnek işletmeler
 *   - örnek kampanyalar (~26 adet, farklı şehir ve kategorilerde)
 *
 * Kullanım:
 *   node scripts/seedFirestore.mjs
 *
 * Kimlik doğrulama (3 yoldan biri):
 *   1) GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccount.json (en net)
 *   2) gcloud auth application-default login  (Google Cloud SDK)
 *   3) Firebase Emulator:  $env:FIRESTORE_EMULATOR_HOST="localhost:8080"
 *
 * Proje ID otomatik olarak .firebaserc'den alınır; ayrıca
 * GCLOUD_PROJECT / GOOGLE_CLOUD_PROJECT env ile override edilebilir.
 */

import { initializeApp, getApps, applicationDefault } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

// ─── Project ID'yi .firebaserc'den oku (veya env'den) ────────────────────────
function resolveProjectId() {
  if (process.env.GCLOUD_PROJECT) return process.env.GCLOUD_PROJECT;
  if (process.env.GOOGLE_CLOUD_PROJECT) return process.env.GOOGLE_CLOUD_PROJECT;
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const rc = JSON.parse(
      readFileSync(resolve(here, '..', '.firebaserc'), 'utf8'),
    );
    return rc?.projects?.default ?? null;
  } catch {
    return null;
  }
}

const projectId = resolveProjectId();
const emulator = process.env.FIRESTORE_EMULATOR_HOST;

if (!getApps().length) {
  if (emulator) {
    // Emulator: credential gerekmez.
    initializeApp({ projectId: projectId ?? 'demo-project' });
    console.log(`🧪 Firestore emulator: ${emulator} (projectId=${projectId ?? 'demo-project'})`);
  } else {
    // Prod: GOOGLE_APPLICATION_CREDENTIALS gerekli.
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error(
        '\n❌ GOOGLE_APPLICATION_CREDENTIALS ayarlı değil.\n\n' +
        '1) Firebase Console → Project Settings → Service Accounts → "Generate new private key" ile JSON indir.\n' +
        '2) Sonra PowerShell\'de:\n' +
        '     $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\tam\\yol\\serviceAccount.json"\n' +
        '     npm run seed\n',
      );
      process.exit(1);
    }
    initializeApp({ credential: applicationDefault(), projectId });
    console.log(`🔐 Prod Firestore bağlantısı (projectId=${projectId})`);
  }
}

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
  { id: 'bakirkoy-aydem', name: 'Bakırköy Aydem Sahne', cityId: 'istanbul', district: 'Bakırköy', address: 'Cevizlik, İzzet Molla Sk. No:4/A, 34142 Bakırköy/İstanbul' },
];

// ─── Kampanyalar (~24) ───────────────────────────────────────────────────────
const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

// Unsplash seed görselleri (hızlı, lazy load uyumlu)
const IMG = (id, seed) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80${seed ? `&sig=${seed}` : ''}`;

// Kategori bazlı dummy galeri görselleri — her kampanyaya detayda
// kaydırmalı 3'lü görsel sunumu için 2 ekstra yardımcı görsel eklenir.
const GALLERY_IMAGES_BY_CATEGORY = {
  restoran: [
    'photo-1517248135467-4c7edcad34c4', // masa / mekan
    'photo-1555396273-367ea4eb4db5',    // tabak / yemek
    'photo-1466978913421-dad2ebd01d17',  // gece atmosfer
  ],
  guzellik: [
    'photo-1522337360788-8b13dee7a37e', // salon
    'photo-1596462502278-27bfdc403348', // cilt bakımı
    'photo-1560066984-138dadb4c035',    // kuaför
  ],
  seyahat: [
    'photo-1566073771259-6a8506099945', // otel cephe
    'photo-1445019980597-93fa8acb246c', // oda
    'photo-1520250497591-112f2f40a3f4', // havuz / deniz
  ],
  wellness: [
    'photo-1540555700478-4be289fbecef', // spa
    'photo-1544161515-4ab6ce6db874',    // masaj
    'photo-1519824145371-296894a0daa9', // aroma / mum
  ],
  eglence: [
    'photo-1503095396549-807759245b35', // tiyatro sahnesi
    'photo-1507924538820-ede94a04019d', // salon / oturma
    'photo-1514306191717-452ec28c7814', // ışık / sahne
  ],
  spor: [
    'photo-1534438327276-14e5300c3a48', // fitness
    'photo-1544367567-0f2fcb009e0b',    // yoga
    'photo-1574680096145-d05b474e2155', // koşu
  ],
  egitim: [
    'photo-1522202176988-66273c2fd55f',
    'photo-1523240795612-9a054b0db644',
    'photo-1524178232363-1fb2b075b655',
  ],
  alisveris: [
    'photo-1483985988355-763728e1935b',
    'photo-1441986300917-64674bd600d8',
    'photo-1472851294608-062f824d29cc',
  ],
  otomotiv: [
    'photo-1492144534655-ae79c964c9d7',
    'photo-1580273916550-e323be2ae537',
    'photo-1552519507-da3b142c6e3d',
  ],
  evcil: [
    'photo-1587300003388-59208cc962cb',
    'photo-1514888286974-6c03e2ca1dba',
    'photo-1517849845537-4d257902454a',
  ],
  diger: [
    'photo-1513151233558-d860c5398176',
    'photo-1518791841217-8f162f1e1131',
    'photo-1533090161767-e6ffed986c88',
  ],
};

/**
 * Kampanyanın images dizisini minimum 3'e genişletir.
 * Mevcut görselleri korur, kategori havuzundan ek dummy'ler ekler.
 */
function expandGallery(campaign) {
  const existing = Array.isArray(campaign.images) ? [...campaign.images] : [];
  if (existing.length >= 3) return existing.slice(0, 3);

  const pool = GALLERY_IMAGES_BY_CATEGORY[campaign.categoryId]
    ?? GALLERY_IMAGES_BY_CATEGORY.diger;

  // Tekrar etmemesi için küçük sapma seed'iyle ekle
  let salt = 90 + (campaign.id?.length ?? 0);
  for (const photoId of pool) {
    if (existing.length >= 3) break;
    const url = IMG(photoId, salt++);
    if (!existing.includes(url)) existing.push(url);
  }
  return existing.slice(0, 3);
}

const demoCampaigns = [
  // ── Bursa — Spa & Wellness ───────────────────────────────────────
  {
    id: 'aromaterapi-kacis',
    title: 'Aromaterapi Kaçış Paketi',
    description:
      'Ethereal Sanctuary Spa\'nın usta terapistleri eşliğinde botanik yağlarla hazırlanan 90 dakikalık aromaterapi kaçışı. Nilüfer Kent Meydanı\'nda, Bursa\'nın merkezinde; modern kabinler, hijyen odaklı tek kullanımlık ürünler ve seans sonunda bitki çayı ikramı ile günün yorgunluğunu üzerinizden atın. Lavanta, okaliptüs ve portakal çiçeği karışımı özel yağımız duyularınızı canlandırırken yoğun uygulama derin dokuyu rahatlatır.',
    shortDescription:
      'Ethereal Spa\'da 90 dk botanik aromaterapi + buhar seansı + bitki çayı ikramı. Çift paketi mevcut.',
    businessId: 'ethereal-spa',
    businessName: 'Ethereal Sanctuary Spa',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'wellness',
    price: 980, originalPrice: 1400, rating: 4.9,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBabKUWvZgRmuNzv2ERfn1a9wW8I1SjW03MMHHX6iNRPmsh1kuvlUcz9lmnYjWilETqxwxQJ4Gjue2-QtpMgZSm98JoKW6onQe7puApuJE8gIDhlUlajx0FeOQrXhCOsZ8-1ZPAmqm5zsnTd1ha2-PW1htZzs1_uL8RKjI7-wn1AV8QtT6DDc8A2dyU4FhBLEiT9fa-MjZZMJdzmOMWoZFOb2jRsjftCn6Sbuf13k5v3r0obGSwC0IMFgbjHJunDcJebGES9178-cQ'],
    isFeatured: true, daysLeft: 14,
    packages: [
      { name: '1 Kişilik Klasik (60 dk)', description: '60 dk aromatik yağ masajı + bitki çayı', price: 650, originalPrice: 950, quota: 60, soldCount: 8, isDefault: true },
      { name: '1 Kişilik Tam Paket (90 dk)', description: '90 dk masaj + buhar seansı + bitki çayı', price: 980, originalPrice: 1400, quota: 40, soldCount: 3 },
      { name: '2 Kişilik Çift Paketi (90 dk)', description: 'İki kişilik yan yana kabin, 90 dk masaj + buhar', price: 1750, originalPrice: 2700, quota: 20, soldCount: 1 },
    ],
    content: {
      highlights: [
        'Botanik özlü birinci sınıf aromaterapi yağları',
        'Kişiye özel aroma karışımı (lavanta, okaliptüs, portakal)',
        'Hijyenik tek kullanımlık bornoz ve terlik',
        'Seans sonu bitki çayı ve kuruyemiş ikramı',
        'Uzman sertifikalı terapist',
      ],
      included: ['90 dk aromaterapi masajı', 'Buhar odası kullanımı (20 dk)', 'Havlu, bornoz, terlik', 'Bitki çayı & kuruyemiş ikramı', 'Duş ve kişisel dolap'],
      notIncluded: ['Ek süre (ek dakika başına ücret)', 'Kişisel bakım ürünleri', 'Cilt bakım ilaveleri'],
      howToUse: [
        'Satın alma sonrası kupon kodunuz panelinize düşer.',
        '+90 224 000 00 00 numaradan veya WhatsApp üzerinden randevu alın.',
        'Randevudan en az 12 saat önce onay mesajı alacaksınız.',
        'Rezervasyon saatinden 15 dk önce resepsiyona gelin, kupon kodunuzu gösterin.',
        'Keyfinize bakın — sonrasında bitki çayı ikramımız sizi bekliyor.',
      ],
      terms:
        '• Seans randevu ile yapılır, salonda bekleme süresi yoktur.\n' +
        '• Randevu iptali en az 12 saat önceden bildirilmelidir; aksi halde kupon kullanılmış sayılır.\n' +
        '• Hamilelik, kalp rahatsızlığı veya cilt problemleri varsa seans öncesi bilgilendirin.\n' +
        '• Çift paketinde iki kişinin aynı gün aynı saatte gelmesi esastır.\n' +
        '• Hafta sonu ve bayram günlerinde rezervasyon en az 3 gün öncesinden alınmalıdır.',
      faq: [
        { question: 'Hamile biri aromaterapi masajı alabilir mi?', answer: '12. haftadan sonra ve doktor onayı varsa hafif uygulama yapabiliyoruz; seans öncesi bilgilendirme şarttır.' },
        { question: 'Çift paketinde iki kişi aynı kabinde mi olacak?', answer: 'Evet, yan yana iki masaj yatağı bulunan özel çift kabinimizde hizmet verilir.' },
        { question: 'Seansım sırasında aromaterapi yağını değiştirebilir miyim?', answer: 'Tabii ki. Terapistiniz seans başında kişisel tercihlerinizi sorar ve karışımı size göre hazırlar.' },
        { question: 'Park imkanı var mı?', answer: 'Ethereal Spa\'nın özel kapalı otoparkı müşterilerimize ücretsizdir.' },
      ],
    },
  },
  {
    id: 'sicak-tas-terapisi',
    title: 'Sıcak Taş Terapisi (75 dk)',
    description:
      'Isıtılmış bazalt taşları ve özel botanik yağların derin doku gevşemesi için birleştiği 75 dakikalık ritüel. Bazalt taşlar vücudunuza 50-55°C dereceye kadar ısıtılmış olarak yerleştirilir, dolaşım sistemini canlandırır, kaslardaki kronik gerilimi çözer. Hamilelerde önerilmez. Kronik sırt ve bel ağrılarında belirgin rahatlama sağlar.',
    shortDescription:
      '75 dk sıcak bazalt taş + aromaterapi yağ uygulaması — kronik gerilim ve bel ağrıları için birebir.',
    businessId: 'ethereal-spa',
    businessName: 'Ethereal Sanctuary Spa',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'wellness',
    price: 775, originalPrice: 1050, rating: 4.8,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAIeuke514OVHHTN5RPoahiVdsL8sAFMMrKsAHmL4A2kOw4tpajULDjKyXNi5fduUBLZtWOmeNaKo1TFWxUy7f-k_dAM1Hu-QfwZF0dkCbplX3x1sYy1zPoaDeQn89DcU3Qb_ySFq4pXtG9caprRBIYyeUIIzcE8IB19H-tW9GYoOBR5_YjEnHQCUo5PzWe4ra1t_iwlu_abFliiwJ58uykppiYsnaKKDU8YGa1Scs0bO-BG7bCXF6FrVINJ-P_Z54ACLjsceGBWGI'],
    quota: 80, soldCount: 30, isFeatured: true, daysLeft: 10,
    content: {
      highlights: [
        'Doğal bazalt taşlar, dermatolojik test onaylı',
        'Dolaşım ve lenfatik sistem canlandırıcı etki',
        'Kronik bel ve sırt ağrılarına özel',
        'Seans öncesi sağlık formu',
      ],
      included: ['75 dk sıcak taş + yağ uygulaması', 'Havlu, bornoz, terlik', 'Duş kullanımı'],
      notIncluded: ['Aromaterapi yağı yükseltmesi', 'Ekstra seans süresi'],
      howToUse: [
        'Kuponunuzu alın.',
        'Randevu için arayın; seans öncesi sağlık formu doldurulur.',
        'Randevudan 2 saat önce ağır yemek yemeyin.',
        'Resepsiyonda kupon kodunuzu gösterin.',
      ],
      terms:
        '• Hamileler, kalp hastaları, yüksek tansiyon ve epilepsi hastaları seans alamaz.\n' +
        '• Seans sırasında aşırı ısınma hissi terapiste bildirilmelidir.\n' +
        '• Randevu 12 saat öncesinden iptal edilmezse kupon kullanılmış sayılır.',
      faq: [
        { question: 'Taşlar tam olarak kaç derece?', answer: '50-55°C arası, her zaman terapistin cildinde test edilir.' },
        { question: 'Bel fıtığı var, alabilir miyim?', answer: 'Doktor onayı varsa hafif uygulama yapabiliyoruz; seans öncesi bilgilendirin.' },
      ],
    },
  },
  {
    id: 'gelinlik-isilti',
    title: 'Gelinlik Işıltısı 4 Haftalık Program',
    description:
      'Özel gününüze en iyi versiyonunuzla çıkmanız için Lumen Beauty Clinic\'in uzman estetisyenleri tarafından kurgulanan 4 haftalık bütünsel program. Cilt analiziyle başlar, her hafta farklı uygulamayla ilerler: derin temizlik, polisaj, hydrafacial, mezoterapi ve son hafta ışıltı paketi. Vücut polisajı + manikür/pedikür dahil. Kampanya 21 günlük süreyle sınırlı.',
    shortDescription:
      '4 haftalık gelin hazırlık programı — cilt analizi, hydrafacial, mezoterapi, vücut polisajı dahil.',
    businessId: 'lumen-beauty',
    businessName: 'Lumen Beauty Clinic',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'guzellik',
    price: 3200, originalPrice: 4250, rating: 4.9,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDDWJ4hRq0TSARuLC5o0bZTRW8F_4HaOLCCPAEnsyqr6Muh7WRQnRsij0EsWYUU1lsbEaSjuuh1k-y-iy3CSVyAn94m4rsMEz2qyqGI1URl5xk9zH29vNqSd6z8tHU6fOFW3O8OSNnhKJCOLFcDeJufDLZ8JgLJzCaxmuEptEi-SsT9jj6px0iWus00XFVPAZ0SOpZPZJxBhFWLpL3WJvZLlP9G1NtNYdaiXiRHgSoQSETVLXQJr7GNpFtzdExVygJpDFIMj-AFdgs'],
    isFeatured: true, daysLeft: 21,
    packages: [
      { name: 'Klasik Program (4 Hafta)', description: '4 hafta cilt + vücut polisajı', price: 3200, originalPrice: 4250, quota: 30, soldCount: 3, isDefault: true },
      { name: 'Premium Program (4 Hafta)', description: 'Klasik + mezoterapi + manikür/pedikür dahil', price: 4500, originalPrice: 6200, quota: 20, soldCount: 2 },
    ],
    content: {
      highlights: [
        '4 hafta boyunca haftada 1 seans',
        'Kişiye özel cilt analizi ve program',
        'Dermatolog onaylı ürünler',
        'Düğün haftası son rötuş seansı',
        'WhatsApp\'tan randevu takibi',
      ],
      included: ['4 seans cilt bakımı', 'Hydrafacial 1 seans', 'Vücut polisajı 1 seans', 'Cilt analizi raporu', 'Evde bakım kiti'],
      notIncluded: ['Saç ve makyaj', 'Dermatolog konsültasyonu', 'Ev ziyaretleri'],
      howToUse: [
        'Program süresi 4 haftadır, ilk seans için 3 gün önceden randevu alınmalıdır.',
        'Cilt analizi seansı yaklaşık 45 dakika sürer.',
        'Her hafta aynı gün/saat aynı estetisyenle devam edilir.',
        'Son seans düğüne en fazla 7 gün kala yapılır.',
      ],
      terms:
        '• Program başladıktan sonra süre uzatılamaz.\n' +
        '• Seanslar aynı kişi içindir, devredilemez.\n' +
        '• Cilt hassasiyeti varsa program öncesi dermatolog onayı gerekir.\n' +
        '• İptal 14 gün öncesinden bildirilmelidir.',
      faq: [
        { question: 'Programı düğünden ne kadar önce başlamalıyım?', answer: 'En az 5 hafta önce başlamanızı öneriyoruz — son seans düğüne 7 gün kala bitecek şekilde planlanır.' },
        { question: 'Hassas cildim var, program bana uygun mu?', answer: 'Cilt analizi seansında hassasiyet tespit edilirse uygulamalar kişiselleştirilir.' },
        { question: 'Düğüne 3 hafta var, yetişir mi?', answer: 'Klasik programı sıkıştırarak 3 haftaya indirebiliyoruz; bize ulaşın.' },
      ],
    },
  },
  {
    id: 'cicekli-banyo',
    title: 'Çiçekli Banyo Ritüeli (30 dk Banyo + 30 dk Masaj)',
    description:
      'Gül ve lavanta yapraklarıyla süslenmiş özel küvetinizde 30 dakikalık değerli yağ banyosu ve ardından mineralize canlandırıcı 30 dk masaj. Romantik bir aktivite veya yalnız kalma isteği için ideal. Küvet her müşteri için yeniden yıkanır, güller taze getirilir.',
    shortDescription:
      '30 dk çiçekli banyo + 30 dk mineralize masaj — romantik bir kaçış için.',
    businessId: 'ethereal-spa',
    businessName: 'Ethereal Sanctuary Spa',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'wellness',
    price: 600, originalPrice: 900, rating: 4.7,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuB4opsxUB-GtC5HZpmxuZzpy7ehp9s14u92WIH4PPinbFbjJnJVQhMAy5kcno97vMwVh_LNXtjF59UsrqaDN05kI_hLEhXOoqhgYDG7NYG0JNwriApXi4m78EGh4L3Qv7ur8rhvdXi5Z5WtmaeKiJ_WwBPm-qqyChK0BW6SgKFaKuSEfNjdEvIt6T9gH6zFtEn4eUsAlXQm32MiujctG5O3MQwdo74ZrtIaigWu7E7RlcJDurq3nNq_Oz2G0a06wIlccgqTuUaGfoE'],
    isFeatured: false, daysLeft: 3,
    packages: [
      { name: 'Tek Kişilik', description: 'Bir kişi için 30+30 dk', price: 600, originalPrice: 900, quota: 20, soldCount: 12, isDefault: true },
      { name: 'Çiftler Paketi', description: 'İki kişilik küvet, iki masaj yatağı, 2 kadeh ev şarabı ikramı', price: 1150, originalPrice: 1800, quota: 10, soldCount: 6 },
    ],
    content: {
      highlights: [
        'Taze gül ve lavanta yaprakları',
        'Organik bergamot & neroli yağlı banyo',
        'Mum ışığında romantik atmosfer',
        'Küvet her müşteride yeniden hijyenize edilir',
        'Çiftler paketinde şarap ikramı',
      ],
      included: ['30 dk çiçekli banyo', '30 dk mineralize masaj', 'Bornoz, havlu, terlik', 'Çiftler paketinde: 2 kadeh ev şarabı'],
      notIncluded: ['Saç bakımı ve manikür', 'Yemek servisi'],
      howToUse: [
        'Rezervasyon için en az 2 gün önceden arayın.',
        'Çiftler paketinde ikinci kişi adıyla randevu oluşturun.',
        'Seans öncesi duş almanız önerilir.',
      ],
      terms:
        '• Çiftler paketi yalnızca çift rezervasyonuyla kullanılır.\n' +
        '• Cilt alerjiniz varsa mutlaka bildirin (yağ değiştirilir).\n' +
        '• Bornoz ve havlu tarafımızdan temin edilir; kendi kıyafetlerinizi getirmeniz gerekmez.',
      faq: [
        { question: 'Kendi mayomu/bornozumu getirmeli miyim?', answer: 'Hayır, hepsi tarafımızdan hijyenik biçimde sağlanır.' },
        { question: 'Yıldönümüz için sürpriz hazırlayabilir misiniz?', answer: 'Rezervasyon sırasında bildirirseniz şarap, gül yaprakları ve mum düzenlemesi yapabiliyoruz.' },
      ],
    },
  },
  // ── Bursa — Restoran ─────────────────────────────────────────────
  {
    id: 'serpme-kahvalti',
    title: 'Bahçe Cafe Serpme Köy Kahvaltısı (2 Kişi)',
    description:
      'Heykel Meydanı\'na bakan tarihi bahçemizde Uludağ eteklerinden gelen taze malzemelerle 25 çeşit serpme kahvaltı. Ev yapımı reçel (9 çeşit), köy kaymağı, organik bal, kazan sütü, ev yapımı ekmek, bükme börek, menemen ve sınırsız çay. Hafta sonu müziksiz, sakin; hafta içi canlı akustik müzik eşliğinde. Çocuk sandalyesi ve çocuk tabağı mevcut.',
    shortDescription:
      'Bahçe Cafe\'de 25 çeşit serpme köy kahvaltısı — ev yapımı reçeller, kazan sütü ve sınırsız çay.',
    businessId: 'bahce-cafe',
    businessName: 'Bahçe Cafe & Restaurant',
    cityId: 'bursa', district: 'Osmangazi', categoryId: 'restoran',
    price: 429, originalPrice: 780, rating: 4.8,
    images: [IMG('photo-1533089860892-a7c6f0a88666', 1)],
    isFeatured: false, daysLeft: 20,
    packages: [
      { name: '2 Kişilik Serpme', description: '25 çeşit, sınırsız çay', price: 429, originalPrice: 780, quota: 80, soldCount: 38, isDefault: true },
      { name: '4 Kişilik Aile Paketi', description: '2 yetişkin + 2 çocuk, çocuk tabağı dahil', price: 799, originalPrice: 1480, quota: 30, soldCount: 5 },
    ],
    content: {
      highlights: ['25 çeşit serpme kahvaltı', 'Ev yapımı 9 çeşit reçel', 'Sınırsız çay', 'Bahçe manzaralı masalar', 'Hafta içi canlı akustik müzik'],
      included: ['25 çeşit kahvaltılık', 'Sınırsız demli çay', 'Ev yapımı ekmek sepeti', 'Menemen veya omlet (tercihe göre)'],
      notIncluded: ['Taze meyve suyu (opsiyonel — 60₺)', 'Türk kahvesi', 'Alkollü içecekler'],
      howToUse: [
        'Kupon kodunuzu alın.',
        'Rezervasyon için arayın; hafta sonu en az 2 gün önceden.',
        'Gelişte kodunuzu garsona gösterin.',
      ],
      terms:
        '• Hafta sonu yoğunluğu nedeniyle rezervasyon zorunludur.\n' +
        '• Kahvaltı servisi sabah 08:30 - 13:00 arası yapılır.\n' +
        '• Bayram günleri özel menü uygulanır, kampanya dışındadır.\n' +
        '• Çocuk tabağı 7 yaşına kadardır.',
      faq: [
        { question: 'Glutensiz seçenek var mı?', answer: 'Evet, önceden haber verirseniz glutensiz ekmek seçeneği sunuyoruz.' },
        { question: 'Köpekler kabul ediliyor mu?', answer: 'Bahçe bölümünde küçük ve sakin evcil hayvanlar kabul edilir.' },
        { question: 'Doğum günü için hazırlık yapabilir misiniz?', answer: 'Rezervasyon sırasında bildirirseniz masa süsleme ve pasta organizasyonu yapabiliyoruz.' },
      ],
    },
  },
  {
    id: 'steak-menu',
    title: 'Beef House Premium Steak Menüsü (2 Kişi)',
    description:
      'Beef House Grill\'in 28 gün dry-aged Black Angus bifteği, mevsim garnitürleri ve şef özel soslarıyla servis edilen 4 kap premium menü. Başlangıç, ana yemek (300 gr dry-age T-bone veya ribeye), garnitür seçimi ve ev yapımı tatlı. Mengerler ızgara üzerinde klasik yöntem. Şarap listesi zengin; paketimizde 1 şişe ev şarabı seçeneği mevcut.',
    shortDescription:
      '28 gün dry-aged Black Angus biftek + garnitür + ev yapımı tatlı. Şarap ilaveli paket mevcut.',
    businessId: 'beef-house',
    businessName: 'Beef House Grill',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'restoran',
    price: 1680, originalPrice: 2400, rating: 4.9,
    images: [IMG('photo-1544025162-d76694265947', 2)],
    isFeatured: true, daysLeft: 30,
    packages: [
      { name: '2 Kişilik Standart Menü', description: 'Başlangıç + 300gr T-bone + garnitür + tatlı', price: 1680, originalPrice: 2400, quota: 40, soldCount: 14, isDefault: true },
      { name: '2 Kişilik + Ev Şarabı', description: 'Standart menü + 1 şişe ev şarabı', price: 2100, originalPrice: 3100, quota: 20, soldCount: 4 },
      { name: '2 Kişilik Deluxe', description: 'Ribeye 500gr + premium şarap + 3 kanapé', price: 2850, originalPrice: 4200, quota: 10, soldCount: 0 },
    ],
    content: {
      highlights: ['28 gün dry-aged Black Angus biftek', 'Mengerler ızgara üzerinde pişirme', 'Şef seçkisi 5 soslu tabak', 'Zengin şarap listesi', 'Balkon masaları rezervasyonla'],
      included: ['Başlangıç (yeşil salata veya mantar çorbası)', '300gr dry-age T-bone veya ribeye', 'Garnitür (patates puresi / grille sebze)', 'Ev yapımı çikolatalı sufle veya cheesecake'],
      notIncluded: ['Kahve / çay', 'Ek siparişler', 'Ekstra sos'],
      howToUse: [
        'Satın alıp kuponunuzu alın.',
        'Rezervasyon için arayın (en az 1 gün önceden önerilir).',
        'Gelişte kodunuzu gösterin; menüyü terminal üzerinden seçebilirsiniz.',
      ],
      terms:
        '• Etin pişirme derecesi (medium/well-done) rezervasyon sırasında belirtilmelidir.\n' +
        '• Balık veya vejetaryen alternatif talepleri önceden iletilmelidir (+200₺ fark).\n' +
        '• 14 Şubat, yılbaşı gibi özel günlerde geçerli değildir.\n' +
        '• Menü kurum tarafından 6 ay boyunca geçerlidir.',
      faq: [
        { question: 'Vejetaryen seçenek var mı?', answer: 'Portobello mantar steak veya ızgara halloumi sunuyoruz; rezervasyonda belirtin, fiyat farkı alınmaz.' },
        { question: 'Bifteği iyi pişmiş istersem sorun olur mu?', answer: 'Evet tabii, pişirme tercihinizi rezervasyonda veya masada belirtebilirsiniz.' },
        { question: 'Şarabımı getirebilir miyim?', answer: 'Hayır, kendi alkolünüz dışarıdan getirilemez.' },
      ],
    },
  },
  {
    id: 'sushi-set',
    title: 'Sakura Sushi — 32 Parça Karışık Seti',
    description:
      'Mudanya sahilindeki Sakura Sushi Bar\'da şefimizin günlük taze malzemelerle hazırladığı 32 parçalık seçki. 8 nigiri (somon, karides, ton, levrek), 12 maki (salatalıklı, avokadolu), 8 uramaki (spicy tuna, California) ve 4 parça özel şef seçkisi. Yanında wasabi, pikla zencefil ve ev yapımı soya sos. Balıkların tamamı İzmir\'den günlük getirilmektedir.',
    shortDescription:
      '32 parça karışık sushi: nigiri, maki, uramaki + şef seçkisi. Günlük taze balık.',
    businessId: 'sakura-sushi',
    businessName: 'Sakura Sushi Bar',
    cityId: 'bursa', district: 'Mudanya', categoryId: 'restoran',
    price: 550, originalPrice: 1100, rating: 4.7,
    images: [IMG('photo-1579871494447-9811cf80d66c', 3)],
    isFeatured: false, daysLeft: 7,
    packages: [
      { name: '32 Parça Tek Kişilik', description: 'Nigiri, maki, uramaki, şef seçkisi', price: 550, originalPrice: 1100, quota: 60, soldCount: 22, isDefault: true },
      { name: '64 Parça Çiftler Seti', description: '2 kişilik + 2 miso çorbası + 2 edamame', price: 990, originalPrice: 1950, quota: 30, soldCount: 3 },
    ],
    content: {
      highlights: ['Günlük taze balık (İzmir\'den)', 'Japonya eğitimli usta şef', 'Ev yapımı soya sos', 'Paket servis veya masa servisi', 'Deniz manzaralı masalar'],
      included: ['32 parça karışık sushi', 'Wasabi, pikla zencefil, soya sos', 'Kağıt mendil ve chopstick'],
      notIncluded: ['Miso çorbası (ek sipariş 60₺)', 'Edamame', 'İçecekler'],
      howToUse: [
        'Mudanya şubesinde yerinde yemek veya paket alım yapabilirsiniz.',
        'Paket siparişi için minimum 1 saat önceden arayın.',
      ],
      terms:
        '• Balık alerjisi olanlar uyarılmalıdır.\n' +
        '• Paket servisi sadece Mudanya ilçesi içindedir.\n' +
        '• Pazartesi günleri kapalıyız.\n' +
        '• Kuponunuz 30 gün içinde kullanılmalıdır (sonrasında uzatma ücreti uygulanır).',
      faq: [
        { question: 'Sushi içindeki balık pişirilmiş mi?', answer: 'Klasik nigiri ve maki çiğdir; pişmiş alternatifler (shrimp tempura, eel) menümüzde mevcut.' },
        { question: 'Çiğ balık yemek hamileler için güvenli mi?', answer: 'Hamilelerin çiğ balık tüketmemesini öneriyoruz; pişmiş alternatifleri tercih edin.' },
        { question: 'Vegan seçenek var mı?', answer: 'Avokado, salatalık ve mantarlı maki/uramaki sunuyoruz.' },
      ],
    },
  },
  {
    id: 'italyan-pizza',
    title: 'La Bella Pizzeria: Pizza + Limonata Menüsü',
    description:
      'Yıldırım\'daki La Bella Pizzeria\'da taş fırında 400°C\'de pişmiş orijinal Napoli usulü pizza. Margherita, Quattro Formaggi, Diavola veya Capricciosa seçenekleri. Yanında ev yapımı limonata (500 ml) ikramı. İtalyan Amelia ailesinin 3. nesil reçeteleriyle; hamur 48 saat doğal mayalamayla hazırlanır. Paket servisi yoğun saatte max 40 dk.',
    shortDescription:
      'Taş fırında 400°C Napoli pizzası + ev yapımı limonata. 48 saat mayalı hamur.',
    businessId: 'la-bella',
    businessName: 'La Bella Pizzeria',
    cityId: 'bursa', district: 'Yıldırım', categoryId: 'restoran',
    price: 315, originalPrice: 420, rating: 4.6,
    images: [IMG('photo-1513104890138-7c749659a591', 4)],
    isFeatured: false, daysLeft: 14,
    packages: [
      { name: 'Tekli Pizza + Limonata', description: 'Orta boy pizza + 500ml limonata', price: 315, originalPrice: 420, quota: 150, soldCount: 72, isDefault: true },
      { name: '2 Pizza + 2 Limonata', description: 'Paylaşım menüsü', price: 590, originalPrice: 840, quota: 80, soldCount: 15 },
    ],
    content: {
      highlights: ['Napoli usulü, 400°C taş fırın', '48 saat mayalı hamur', '%100 İtalyan un ve domates', 'Ev yapımı limonata ikramı', 'Restoranda veya paket'],
      included: ['1 orta boy pizza (seçilen çeşit)', '500 ml ev yapımı limonata', 'Oregano, acı biber'],
      notIncluded: ['Ek malzeme (truffle, prosciutto vb.)', 'Başka içecekler', 'Tatlılar'],
      howToUse: [
        'Kupon kodunu alın.',
        'Restoranda veya telefonla paket sipariş verin.',
        'Kodunuzu paket siparişinde sipariş notu olarak girin.',
      ],
      terms:
        '• Paket servisi Yıldırım ilçesi içindedir, komşu ilçeler için ek ücret alınır.\n' +
        '• Yoğun günlerde (cuma akşamı) paket 60 dk\'ya kadar uzayabilir.\n' +
        '• Ek malzeme ilavesi için yerinde fiyat farkı alınır.',
      faq: [
        { question: 'Vegan peynirli pizza var mı?', answer: 'Evet, ek ücretsiz vegan mozzarella seçeneğimiz var.' },
        { question: 'Glutensiz hamur?', answer: 'Evet, önceden bildirirseniz glutensiz hamur kullanıyoruz (ek 40₺).' },
        { question: 'Paket servisi Nilüfer\'e geliyor mu?', answer: 'Sadece Yıldırım; komşu ilçelere Yemeksepeti üzerinden sipariş verebilirsiniz.' },
      ],
    },
  },
  // ── Bursa — Güzellik ─────────────────────────────────────────────
  {
    id: 'hydrafacial',
    title: 'Lumen Beauty Hydrafacial Cilt Bakımı',
    description:
      'HydraFacial MD cihazıyla 3 aşamalı cilt bakımı: (1) derin temizlik ve eksfoliasyon, (2) gözenek ekstraksiyonu — aspirasyon teknolojisi, (3) antioksidan serum ve nemlendirici uygulaması. FDA onaylı cihaz, tek kullanımlık başlıklar. Seans yaklaşık 45 dakika sürer, sonrasında makyaj yapılabilir. İlk seansta cilt analizi ücretsizdir.',
    shortDescription:
      'HydraFacial MD ile 3 aşamalı profesyonel cilt bakımı — tek seansta görünür sonuç.',
    businessId: 'lumen-beauty',
    businessName: 'Lumen Beauty Clinic',
    cityId: 'bursa', district: 'Nilüfer', categoryId: 'guzellik',
    price: 810, originalPrice: 1800, rating: 4.9,
    images: [IMG('photo-1570172619644-dfd03ed5d881', 5)],
    isFeatured: false, daysLeft: 15,
    packages: [
      { name: 'Tek Seans Bakım', description: 'Temizlik + ekstraksiyon + serum', price: 810, originalPrice: 1800, quota: 30, soldCount: 9, isDefault: true },
      { name: '3 Seans Paketi', description: 'Aylık düzenli bakım programı (30 gün içinde)', price: 2200, originalPrice: 5400, quota: 20, soldCount: 5 },
      { name: '5 Seans Paketi', description: 'İntensif cilt yenileme programı (2 ay içinde)', price: 3400, originalPrice: 9000, quota: 10, soldCount: 2 },
    ],
    content: {
      highlights: ['FDA onaylı HydraFacial MD cihazı', 'İlk seansta ücretsiz cilt analizi', 'Tek kullanımlık steril başlıklar', 'Hemen sonrası makyaj uyumlu', 'Dermatolog onaylı serumlar'],
      included: ['45 dk HydraFacial uygulaması', 'Cilt analizi (ilk seans)', 'Evde bakım önerileri', 'Güneş koruyucu numunesi'],
      notIncluded: ['Botox, dolgu, mezoterapi', 'Evde kullanım ürünleri (satın alınabilir)'],
      howToUse: [
        'Randevu için arayın, cilt tipiniz için uygunluğu teyit edilecek.',
        'Randevudan 24 saat önce peeling/asit ürünleri kullanmayın.',
        'Seansa makyajsız gelmeniz tavsiye edilir (silme olanağı klinikte vardır).',
      ],
      terms:
        '• 3 ve 5 seanslık paketler belirtilen süre içinde kullanılmalıdır.\n' +
        '• Aktif akne krizi, herpes, güneş yanığı olan ciltlerde seans ertelenir.\n' +
        '• 3 ay içinde Roaccutane kullandıysanız bilgilendirin.',
      faq: [
        { question: 'HydraFacial hamilelikte güvenli mi?', answer: 'Evet, içeriklerimiz hamilelik dostu; yine de doktor onayı öneririz.' },
        { question: 'Sonuç ne zaman görülür?', answer: 'İlk seansta görünür ışıltı; kalıcı iyileşme 3 seans sonunda gözlenir.' },
        { question: 'Erkekler için uygun mu?', answer: 'Evet, erkek müşterilerimiz de bu hizmeti rahatlıkla alabilir.' },
      ],
    },
  },
  {
    id: 'keratin-bakim',
    title: 'Élan Kuaför — Keratin + Fön Paketi',
    description:
      'Çekirge Caddesi\'ndeki Élan Kuaför\'de Brezilya menşeli profesyonel keratin bakımı: yıkama, dinlendirici maske, kök-uç keratin uygulaması, ısıl işlem sabitleme ve şekillendirme. Saç boyu / yoğunluğu farkı alınmaz. İlk iki gün saçınızı ıslatmayın, 4 gün sonra normal rutine dönebilirsiniz. Etki 3-4 ay sürer.',
    shortDescription:
      'Brezilya keratin bakımı + yıkama + fön. Uzunluk farkı yok, 3-4 ay kalıcı.',
    businessId: 'elan-kuafor',
    businessName: 'Élan Kuaför & Studio',
    cityId: 'bursa', district: 'Osmangazi', categoryId: 'guzellik',
    price: 900, originalPrice: 1500, rating: 4.8,
    images: [IMG('photo-1560066984-138dadb4c035', 6)],
    isFeatured: false, daysLeft: 25,
    packages: [
      { name: 'Kısa Saç', description: 'Omuzun üstü — uzunluk farkı yok', price: 900, originalPrice: 1500, quota: 40, soldCount: 18, isDefault: true },
      { name: 'Uzun Saç', description: 'Omuz altı — malzeme miktarı yüksek olduğu için', price: 1200, originalPrice: 2000, quota: 40, soldCount: 15 },
    ],
    content: {
      highlights: ['Brezilya menşeli keratin', 'Formaldehit içermeyen formül', 'Uzman stilist eşliğinde', '3-4 ay kalıcı etki', 'Yıkama + fön dahil'],
      included: ['Profesyonel yıkama', 'Keratin kök-uç uygulaması', 'Isıl işlem sabitleme', 'Fön ve şekillendirme'],
      notIncluded: ['Saç boyası', 'Saç kesimi', 'Topuz / saç modeli (ek ücretli)'],
      howToUse: [
        'Rezervasyon için 2 gün önceden arayın.',
        'Seans yaklaşık 2.5-3 saat sürer.',
        'Uygulama sonrası 3 gün saçınızı bağlamayın, ıslatmayın.',
      ],
      terms:
        '• Yıpranmış / boyalı saçlarda sonuç önce sülfatsız şampuan gerektirir (tavsiye edilir, satın alınabilir).\n' +
        '• Hamile ve emzirenler için uygun değildir (koku yoğunluğu).\n' +
        '• Randevu iptali 24 saat öncesinden yapılmalıdır.',
      faq: [
        { question: 'Saçım boyalı, uyumsuz olur mu?', answer: 'Aksine boyalı saçta daha parlak sonuç verir; boyanızın üstüne gelmez.' },
        { question: 'Sonrasında saçımı boyatabilir miyim?', answer: '2 hafta sonra boyatmanızı öneriyoruz.' },
      ],
    },
  },
  // ── Bursa — Seyahat ──────────────────────────────────────────────
  {
    id: 'uludag-termal-kacamak',
    title: 'Uludağ Termal Resort — 2 Gece Kaçamak',
    description:
      'Uludağ Yolu 12. km\'de, denizden 1750 m yüksekte Uludağ Termal Resort\'ta 2 gece konaklama. Doğal termal su havuzu (36°C kapalı + açık), kapalı hamam, buhar odası, masaj salonu ve dağ manzaralı odalar. Yarım pansiyon konsepti (kahvaltı + akşam yemeği açık büfe). Kış aylarında kayak merkezi 3 km uzaklıkta, otelden ücretsiz shuttle. Yaz aylarında Uludağ Milli Park yürüyüşleri için ideal.',
    shortDescription:
      '1750m yüksekte termal resort, 2 gece yarım pansiyon + spa + termal havuz. Süit paketi mevcut.',
    businessId: 'uludag-termal',
    businessName: 'Uludağ Termal Resort',
    cityId: 'bursa', district: 'Osmangazi', categoryId: 'seyahat',
    price: 3025, originalPrice: 4200, rating: 4.7,
    images: [IMG('photo-1566073771259-6a8506099945', 7)],
    isFeatured: true, daysLeft: 45,
    packages: [
      { name: '2 Kişi - Standart Oda (2 Gece)', description: 'Yarım pansiyon + termal havuz + spa kullanımı', price: 3025, originalPrice: 4200, quota: 25, soldCount: 8, isDefault: true },
      { name: '2 Kişi - Süit (2 Gece)', description: 'Süit oda + tam pansiyon + 1 masaj seansı (kişi başı)', price: 4200, originalPrice: 6200, quota: 15, soldCount: 3 },
      { name: '4 Kişi - Aile Süiti (2 Gece)', description: '2+2 aile odası, yarım pansiyon, 2 çocuk 12 yaş altı ücretsiz', price: 5500, originalPrice: 8000, quota: 10, soldCount: 2 },
    ],
    content: {
      highlights: ['36°C doğal termal su', 'Dağ manzaralı odalar', 'Kapalı + açık termal havuzlar', 'Kayak merkezine ücretsiz shuttle', '1750 m yüksekte temiz hava'],
      included: ['2 gece konaklama', 'Açık büfe kahvaltı', 'Açık büfe akşam yemeği (standart pakette)', 'Termal havuz + hamam + buhar odası', 'Wi-Fi', 'Otopark'],
      notIncluded: ['Konaklama vergisi (%2)', 'Mini-bar', 'Spa masaj seansı (süit paketi hariç)', 'Kayak ekipmanı kiralama'],
      howToUse: [
        'Kuponu alın, müsait tarih belirleyin.',
        'Otelin rezervasyon ofisini arayın, müsait tarih bildirin.',
        'Kimliklerinizi ve kuponunuzu resepsiyonda gösterin.',
      ],
      terms:
        '• Müsaitliğe bağlı rezervasyon.\n' +
        '• Resmi tatil ve yılbaşı haftası kampanya dışıdır.\n' +
        '• Rezervasyon iptali 14 gün öncesinden yapılmalıdır.\n' +
        '• 12 yaş altı çocuk aile süitinde ücretsizdir, ek yatak talepleri ücretlidir.\n' +
        '• Evcil hayvanlar kabul edilmez.',
      faq: [
        { question: 'Kayak ekipmanlarını nereden kiralıyabilirim?', answer: 'Kayak merkezindeki kiralık ekipman istasyonunda; otelimizde talep üzerine temin edilebilir.' },
        { question: 'Ekstra gece eklersem?', answer: 'Otelin güncel tarifesinden fark ödenerek süre uzatılabilir.' },
        { question: 'Çocuğumla gelirsem standart odada?', answer: 'Standart oda 2 kişiliktir; ek yatak için kapasiteyi kontrol edin (ek ücretli).' },
      ],
    },
  },
  // ── İstanbul ─────────────────────────────────────────────────────
  {
    id: 'cihangir-brunch',
    title: 'Cihangir Bistro — Boğaz Manzaralı Akşam Yemeği (2 Kişi)',
    description:
      'Sıraselviler Caddesi\'nde Boğaz\'a bakan terası ile Cihangir Bistro\'da 4 kap set menü: şefin günün seçkisi başlangıcı, meze tabağı, ana yemek (dana kaburga veya levrek filesi) ve ev yapımı tatlı. 1 şişe ev şarabı (kırmızı / beyaz) dahil. Çarşamba, Perşembe ve Cuma akşamları canlı caz müzik. Balkon masaları için rezervasyon önceliklidir.',
    shortDescription:
      'Cihangir\'de Boğaz manzaralı 4 kap menü + ev şarabı + canlı caz eşliğinde.',
    businessId: 'cihangir-bistro',
    businessName: 'Cihangir Bistro',
    cityId: 'istanbul', district: 'Beyoğlu', categoryId: 'restoran',
    price: 1450, originalPrice: 2000, rating: 4.8,
    images: [IMG('photo-1514933651103-005eec06c04b', 8)],
    isFeatured: true, daysLeft: 30,
    packages: [
      { name: '2 Kişi Set Menü', description: '4 kap + ev şarabı (iç masa)', price: 1450, originalPrice: 2000, quota: 60, soldCount: 30, isDefault: true },
      { name: '2 Kişi Set Menü + Boğaz Balkonu', description: 'Boğaz manzaralı balkon masası', price: 1850, originalPrice: 2600, quota: 20, soldCount: 7 },
    ],
    content: {
      highlights: ['Boğaz manzaralı terras', 'Canlı caz (Çar-Cum akşamları)', '4 kap set menü', '1 şişe ev şarabı', 'Rezervasyonla balkon masası'],
      included: ['Başlangıç (şefin seçkisi)', 'Meze tabağı (5 çeşit)', 'Ana yemek (dana / balık / vejetaryen)', 'Tatlı', '1 şişe ev şarabı (75cl)'],
      notIncluded: ['Premium şarap listesi', 'Kahve', 'Ek siparişler'],
      howToUse: [
        'Rezervasyon için arayın — Boğaz balkonu için 3 gün öncesinden.',
        'Gelişte kupon kodunuzu garsona gösterin.',
      ],
      terms:
        '• Vejetaryen ana yemek rezervasyonda belirtilmelidir.\n' +
        '• Sevgililer Günü, yılbaşı özel menülerinde geçerli değildir.\n' +
        '• Kupon 2 ay içinde kullanılmalıdır.',
      faq: [
        { question: 'Çocuklu gelebilir miyiz?', answer: '7 yaş üzeri çocuklar kabul edilir; menüye alternatif çocuk porsiyonu hazırlanabilir.' },
        { question: 'Alkol tüketmiyoruz, indirim olur mu?', answer: 'Şarap yerine taze sıkılmış meyve suyu veya 2 özel cocktail verilir.' },
      ],
    },
  },
  {
    id: 'kadikoy-balik',
    title: 'Dok Balık & Mezze — Taze Balık Ziyafeti (2 Kişi)',
    description:
      'Moda Caddesi\'nde Dok Balık & Mezze\'de günlük taze balık deneyimi. 8 çeşit meze (haydari, patlıcan salatası, topik, lakerda, midye pilaki, kalamar tava, semizotu, arnavut ciğeri), ana yemek olarak iki kişilik ızgara levrek veya mevsim balığı. Yanında ev yapımı Ege usulü rakı ikramı. Pazar günü kapalı.',
    shortDescription:
      '8 çeşit meze + 2 kişilik taze balık + ev rakısı. Moda\'nın klasik balık mekanında.',
    businessId: 'kadikoy-dok',
    businessName: 'Dok Balık & Mezze',
    cityId: 'istanbul', district: 'Kadıköy', categoryId: 'restoran',
    price: 1280, originalPrice: 1900, rating: 4.7,
    images: [IMG('photo-1467003909585-2f8a72700288', 9)],
    isFeatured: false, daysLeft: 20,
    packages: [
      { name: '2 Kişi Standart', description: '8 meze + ızgara levrek + 1 ikram rakı', price: 1280, originalPrice: 1900, quota: 45, soldCount: 16, isDefault: true },
      { name: '2 Kişi Premium', description: 'Mezelerin yanında çipura/kalkan seçeneği + 2 rakı', price: 1650, originalPrice: 2400, quota: 20, soldCount: 6 },
    ],
    content: {
      highlights: ['Günlük taze balık', '8 çeşit ev yapımı meze', 'Ev usulü rakı ikramı', 'Tarihsel Moda atmosferi', 'Cam kenarı masaları rezervasyonla'],
      included: ['8 çeşit meze', '2 kişilik ızgara levrek (veya standart seçimli)', '1 ikram rakı (küçük boy)', 'Ekmek, yeşillik, roka'],
      notIncluded: ['Ek rakı / içecek', 'Kalkan, barbun gibi özel balıklar (fark alınır)', 'Tatlı'],
      howToUse: ['Rezervasyon için arayın; Pazar günü kapalıyız.'],
      terms:
        '• Balık türü günlük müsaitliğe göre değişebilir; levrek standart, çipura/kalkan +350₺.\n' +
        '• Pazar kapalı.\n' +
        '• Hafta sonu rezervasyonsuz masa garantilenmez.',
      faq: [
        { question: 'Balık yemiyorum, alternatif var mı?', answer: 'Izgara tavuk veya vegan seçenekler mevcut; rezervasyonda belirtirseniz hazırlarız.' },
        { question: 'Rakı içmesek olur mu?', answer: 'Alkolsüz kokteyl veya taze meyve suyu ile değiştirilir.' },
      ],
    },
  },
  {
    id: 'nisantasi-skin',
    title: 'Nişantaşı Skin Clinic — 5 Seans Lazer Epilasyon',
    description:
      'FDA ve CE onaylı Alma Soprano Titanium diyot lazer cihazıyla tam vücut / bölgesel epilasyon. 5 seanslık komple program. Her cilt tonu ve kıl rengine uygun, yaz-kış fark etmez. Teşvikiye Caddesi\'ndeki klinikte uzman dermatolog denetiminde, tıbbi estetisyenler tarafından uygulanır. Seans süreleri: bacak/kol 45 dk, bikini 20 dk, yüz 15 dk.',
    shortDescription:
      '5 seans Alma Soprano Titanium lazer — bölge seçimli, tüm cilt tonları için uygun.',
    businessId: 'nisantasi-skin',
    businessName: 'Nişantaşı Skin Clinic',
    cityId: 'istanbul', district: 'Şişli', categoryId: 'guzellik',
    price: 4800, originalPrice: 9600, rating: 4.9,
    images: [IMG('photo-1596462502278-27bfdc403348', 10)],
    isFeatured: true, daysLeft: 60,
    packages: [
      { name: 'Bikini + Koltuk Altı (5 Seans)', description: 'En popüler bölgesel paket', price: 2400, originalPrice: 4800, quota: 25, soldCount: 8, isDefault: true },
      { name: 'Bacaklar (5 Seans)', description: 'Komple bacak (diz üstü + diz altı)', price: 3800, originalPrice: 7600, quota: 20, soldCount: 4 },
      { name: 'Tam Vücut (5 Seans)', description: 'Kol, bacak, bikini, koltuk altı, yüz', price: 4800, originalPrice: 9600, quota: 15, soldCount: 3 },
    ],
    content: {
      highlights: ['FDA + CE onaylı Alma Soprano Titanium', 'Tüm cilt tonları için uygun', '4 dalga boyu teknolojisi', 'Acısız uygulama (In-Motion teknolojisi)', 'Dermatolog denetiminde'],
      included: ['5 seans lazer uygulaması', 'Her seanstan önce cilt hazırlığı', 'Seans sonrası yatıştırıcı krem'],
      notIncluded: ['Fotoğraflı takip (opsiyonel ek)', 'Ekstra seans (6. seans ek ücretli)'],
      howToUse: [
        'Randevu için arayın, ön görüşme ücretsizdir.',
        'Seansa tıraşlı gelin (tıraş kremi kullanmayın).',
        'Seans öncesi 24 saat güneş almayın.',
        'Seanslar arası 4-6 hafta olmalıdır.',
      ],
      terms:
        '• 5 seans 10 ay içinde tamamlanmalıdır.\n' +
        '• Hamilelik veya ilaç tedavileri (Roaccutane vb.) durumunda seans ertelenir.\n' +
        '• İptal 48 saat öncesinden bildirilmelidir.\n' +
        '• Seans devredilemez.',
      faq: [
        { question: 'Bronz ciltte yapılır mı?', answer: 'Soprano Titanium bronz ciltte de güvenli; yine de son 1 hafta güneş alınmamış olmalı.' },
        { question: 'Hamilelikte uygulanır mı?', answer: 'Hayır, hamilelik süresince ara vermek gerekir; sonra devam edilebilir.' },
        { question: 'Erkek müşteri alınıyor mu?', answer: 'Evet, sırt, göğüs ve sakal çevresi lazer paketlerimiz mevcut.' },
      ],
    },
  },
  {
    id: 'bosphorus-hotel',
    title: 'Bosphorus Palace — Boğaz Manzaralı 1 Gece',
    description:
      'Beşiktaş Yıldız Caddesi\'nde 5 yıldızlı Bosphorus Palace Hotel\'de Boğaz manzaralı deluxe oda, açık büfe kahvaltı, kapalı havuz, fitness center ve SPA kullanımı dahil. Ortaköy\'e yürüyüş mesafesi, Dolmabahçe Sarayı 10 dk. Odadan Boğaz Köprüsü ve Asya yakası tam görünür. Check-in 14:00, check-out 12:00.',
    shortDescription:
      'Beşiktaş\'ta 5 yıldızlı otelde Boğaz manzaralı oda + açık büfe kahvaltı + spa.',
    businessId: 'bosphorus-hotel',
    businessName: 'Bosphorus Palace Hotel',
    cityId: 'istanbul', district: 'Beşiktaş', categoryId: 'seyahat',
    price: 3400, originalPrice: 5200, rating: 4.8,
    images: [IMG('photo-1551882547-ff40c63fe5fa', 11)],
    isFeatured: true, daysLeft: 40,
    packages: [
      { name: '2 Kişi - Deluxe Oda (Kısmi Manzaralı)', description: '1 gece + kahvaltı', price: 3400, originalPrice: 5200, quota: 30, soldCount: 10, isDefault: true },
      { name: '2 Kişi - Suite (Tam Boğaz Manzaralı)', description: '1 gece + kahvaltı + akşam yemeği', price: 4800, originalPrice: 7500, quota: 15, soldCount: 3 },
      { name: '2 Kişi - Romantik Paket', description: 'Suite + 2 kişilik spa kupu + şampanya + gül düzenlemesi', price: 6200, originalPrice: 9800, quota: 8, soldCount: 1 },
    ],
    content: {
      highlights: ['Tam Boğaz manzaralı odalar', 'Açık büfe Türk + kontinental kahvaltı', 'Kapalı havuz + buhar odası', 'Ortaköy\'e yürüyüş mesafesi', '24 saat oda servisi'],
      included: ['1 gece konaklama', 'Açık büfe kahvaltı', 'Wi-Fi', 'Fitness center kullanımı', 'Valet park (limitli)'],
      notIncluded: ['Mini-bar', 'Oda servisi yiyecek/içecek', 'Konaklama vergisi', 'Spa masaj (ek ücretli)'],
      howToUse: ['Rezervasyon için arayın, müsaitliğe göre tarih belirleyin.'],
      terms:
        '• Müsaitliğe bağlı rezervasyon.\n' +
        '• 14 Şubat, yılbaşı haftası ve resmi bayramlar kampanya dışıdır.\n' +
        '• İptal 7 gün öncesinden bildirilmelidir.\n' +
        '• Konaklama vergisi (%2) ayrıca tahsil edilir.\n' +
        '• Evcil hayvan kabul edilmez.',
      faq: [
        { question: 'Check-in\'e erken gelebilir miyim?', answer: 'Müsaitliğe göre 12:00\'dan itibaren alınabilirsiniz; garanti ek ücretlidir.' },
        { question: 'Otopark var mı?', answer: 'Otelin valet park hizmeti ücretsizdir (sınırlı kapasite).' },
        { question: 'Çocuklu gelirsem?', answer: '6 yaş altı ücretsiz konaklar; ek yatak talep edilebilir.' },
      ],
    },
  },
  // ── Ankara ───────────────────────────────────────────────────────
  {
    id: 'cankaya-steak',
    title: 'Çankaya Steakhouse — Premium Steak Menü (2 Kişi)',
    description:
      'Tunalı Hilmi Caddesi\'nin en eski steakhouse\'larından Çankaya Steakhouse\'da 28 gün kuru dinlendirilmiş Türk Angus T-bone veya USDA Choice Tomahawk, şef özel soslar (5 çeşit), kömür ızgara sebze garnitürü ve ev yapımı tatlı. Ankara\'nın hukuk ve siyaset çevrelerinin tercih ettiği klasik mekan. Şarap mahzeninde 80+ etiket.',
    shortDescription:
      'Tunalı\'nın klasiği — 28 gün dry-aged steak + 5 sos + kömür ızgara garnitür.',
    businessId: 'cankaya-steak',
    businessName: 'Çankaya Steakhouse',
    cityId: 'ankara', district: 'Çankaya', categoryId: 'restoran',
    price: 1550, originalPrice: 2300, rating: 4.7,
    images: [IMG('photo-1551183053-bf91a1d81141', 12)],
    isFeatured: false, daysLeft: 25,
    packages: [
      { name: '2 Kişi - T-Bone Menü', description: '28 gün dry-aged T-bone (600 gr toplam)', price: 1550, originalPrice: 2300, quota: 40, soldCount: 16, isDefault: true },
      { name: '2 Kişi - Tomahawk Menü', description: 'USDA Choice Tomahawk (1.2 kg) paylaşım', price: 2200, originalPrice: 3400, quota: 20, soldCount: 3 },
    ],
    content: {
      highlights: ['28 gün kuru dinlendirilmiş Türk Angus', 'USDA Choice Tomahawk seçeneği', 'Kömür ızgara pişirme', '5 şef özel sos', '80+ şarap etiketi'],
      included: ['Başlangıç (salata veya çorba)', 'Ana yemek (T-bone veya Tomahawk)', 'Izgara sebze garnitür', 'Tatlı (crème brulée / cheesecake)'],
      notIncluded: ['Şarap ve içecek', 'Kahve', 'Ek sos (fiyata dahil 5 sos)'],
      howToUse: ['Rezervasyon için arayın, tomahawk 1 gün önceden bildirilmelidir.'],
      terms:
        '• Pişirme derecesi rezervasyonda belirtilmelidir.\n' +
        '• Tomahawk menü önceden sipariş gerektirir.\n' +
        '• Pazar akşamı kapalıyız.',
      faq: [
        { question: 'Çocuk menüsü var mı?', answer: 'Evet, 12 yaş altı için özel porsiyon menüsü mevcut.' },
        { question: 'Vejetaryen alternatif var mı?', answer: 'Portobello mantar steak alternatifi sunuyoruz.' },
      ],
    },
  },
  {
    id: 'mavi-spa',
    title: 'Mavi Wellness — Hamam + Köpük + Masaj Paketi',
    description:
      'Kavaklıdere\'de Mavi Wellness Spa\'da geleneksel Türk hamamı deneyimi: 15 dk göbek taşında ısınma, 15 dk kese + köpük uygulaması, 45 dk aromaterapi masajı ve seans sonunda şerbet ikramı. Kadın ve erkek tellakler ayrı bölümlerde hizmet verir. 200 yıllık tarihi hamam atmosferi, modern hijyen standartları. Peştemal ve takunya dahil.',
    shortDescription:
      'Tarihi Ankara hamamında 15dk köpük + kese + 45dk aromaterapi masajı + şerbet.',
    businessId: 'ankara-spa-mavi',
    businessName: 'Mavi Wellness Spa',
    cityId: 'ankara', district: 'Çankaya', categoryId: 'wellness',
    price: 720, originalPrice: 1200, rating: 4.8,
    images: [IMG('photo-1540555700478-4be289fbecef', 13)],
    isFeatured: true, daysLeft: 18,
    packages: [
      { name: 'Klasik (75 dk)', description: 'Hamam + köpük + 45 dk masaj', price: 720, originalPrice: 1200, quota: 50, soldCount: 22, isDefault: true },
      { name: 'VIP (105 dk)', description: 'Klasik + özel kabin + yüz maskesi + 15 dk ekstra masaj', price: 1100, originalPrice: 1850, quota: 20, soldCount: 6 },
    ],
    content: {
      highlights: ['200 yıllık tarihi hamam', 'Göbek taşı ısıl terapi', 'Kadın/erkek ayrı bölümler', 'Kese + köpük seansı', 'Şerbet ikramı'],
      included: ['Göbek taşı + 15 dk ısınma', '15 dk kese + köpük uygulaması', '45 dk aromaterapi masajı', 'Peştemal, takunya, lif kesesi', 'Şerbet ikramı'],
      notIncluded: ['Yüz maskesi (VIP pakete dahil)', 'Saç bakımı', 'Özel kabin (VIP pakete dahil)'],
      howToUse: [
        'Rezervasyon için arayın.',
        'Seans saatinizden 20 dk önce gelin.',
        'Çıplak değil, bornoz/peştemal ile hizmet alınır.',
      ],
      terms:
        '• Kardiyak hastalık, yüksek tansiyon rahatsızlığı varsa bildirin.\n' +
        '• Hamile ve adet dönemi uygun değildir.\n' +
        '• Kupon 3 ay içinde kullanılmalıdır.',
      faq: [
        { question: 'Erkek olarak kadın tellak tercih edebilir miyim?', answer: 'Hayır; geleneksel kurallar gereği kadın tellak sadece kadın bölümünde çalışır.' },
        { question: 'Hamama gece de girebilir miyim?', answer: 'Pazartesi-Cumartesi 09:00-23:00 açığız, Pazar 10:00-20:00.' },
      ],
    },
  },
  // ── İzmir ────────────────────────────────────────────────────────
  {
    id: 'alsancak-kahvalti',
    title: 'Alsancak Coffee House — Ege Usulü Kahvaltı Tabağı',
    description:
      'Kıbrıs Şehitleri Caddesi\'nde Alsancak Coffee House\'da Ege mutfağının özel kahvaltı tabağı. Zeytin çeşitleri (5 tip), peynir seçkisi (Ezine, Kaşar, Taze Kaşar, Sepet), Ege otları (ebegümeci, radika, turp otu), ev yapımı börekler (su böreği, Çiğdem böreği), taze domates-salatalık, ev yapımı reçeller, domatesli omletimiz ve pandespanya servis ediliyor. Ege\'nin enfes sabah kahvesi, sınırsız portakal suyu. Hafta sonu akustik müzik.',
    shortDescription:
      'Ege mutfağı özel kahvaltı tabağı — zeytin, ot, börek, peynir çeşitleri + sınırsız çay.',
    businessId: 'alsancak-kahve',
    businessName: 'Alsancak Coffee House',
    cityId: 'izmir', district: 'Konak', categoryId: 'restoran',
    price: 350, originalPrice: 550, rating: 4.6,
    images: [IMG('photo-1493770348161-369560ae357d', 14)],
    isFeatured: false, daysLeft: 30,
    packages: [
      { name: 'Kişi Başı Serpme', description: 'Tam tabak + sınırsız çay', price: 350, originalPrice: 550, quota: 100, soldCount: 52, isDefault: true },
      { name: '2 Kişilik Paylaşım Tabağı', description: 'Aile boy paylaşım + 2 taze sıkılmış portakal suyu', price: 650, originalPrice: 1050, quota: 60, soldCount: 20 },
    ],
    content: {
      highlights: ['Ege mutfağı spesiyali', '5 çeşit zeytin, 4 çeşit peynir', 'Ev yapımı börek', 'Sınırsız çay + kahve', 'Hafta sonu akustik müzik'],
      included: ['Ege kahvaltı tabağı', 'Sınırsız çay', 'Ev yapımı ekmek sepeti', 'Domatesli omlet veya menemen'],
      notIncluded: ['Taze sıkılmış portakal suyu (tek kişilikte ek 45₺)', 'Türk kahvesi', 'Dondurma'],
      howToUse: ['Hafta sonu rezervasyonla.', 'Kodunuzu garsona gösterin.'],
      terms:
        '• Hafta sonu sabah 10:00-13:00 arası rezervasyon önerilir.\n' +
        '• Kurban Bayramı süresince menü farklılaşabilir.\n' +
        '• Evcil hayvan bahçe alanında kabul edilir.',
      faq: [
        { question: 'Vegan seçenek var mı?', answer: 'Evet, peynirler çıkarılarak vegan tabağa dönüştürülür; ek ücretsiz.' },
        { question: 'Çocuk menüsü?', answer: 'Küçük çocuklar için sade kahvaltı hazırlanabilir.' },
      ],
    },
  },
  {
    id: 'cesme-resort',
    title: 'Çeşme Beach Resort — 2 Gece Tam Pansiyon',
    description:
      'Ilıca sahiline sıfır 5 yıldızlı Çeşme Beach Resort\'ta 2 gece konaklama, tam pansiyon plus konsept (açık büfe kahvaltı-öğle-akşam + seçili içecekler dahil). Özel kumsal, 3 havuz (biri çocuk havuzu), spa ve wellness merkezi, 2 restoran, beach bar, kids club (4-12 yaş). 2.5 km kumsal, su sporları merkezi, yat iskelesi. Check-in 14:00, check-out 12:00.',
    shortDescription:
      'Ilıca\'da denize sıfır 5★ resort, 2 gece tam pansiyon + içecek + spa + kumsal.',
    businessId: 'cesme-resort',
    businessName: 'Çeşme Beach Resort',
    cityId: 'izmir', district: 'Çeşme', categoryId: 'seyahat',
    price: 6800, originalPrice: 10500, rating: 4.9,
    images: [IMG('photo-1520250497591-112f2f40a3f4', 15)],
    isFeatured: true, daysLeft: 50,
    packages: [
      { name: '2 Kişi - Bahçe Manzaralı', description: 'Standart oda, tam pansiyon plus', price: 6800, originalPrice: 10500, quota: 25, soldCount: 7, isDefault: true },
      { name: '2 Kişi - Deniz Manzaralı', description: 'Deniz manzaralı oda, tam pansiyon plus', price: 7900, originalPrice: 12800, quota: 15, soldCount: 3 },
      { name: '2+2 Aile Süiti', description: '2 yetişkin + 2 çocuk (12 yaş altı ücretsiz), tam pansiyon plus', price: 9500, originalPrice: 14500, quota: 10, soldCount: 1 },
    ],
    content: {
      highlights: ['Özel 2.5 km kumsal', '3 havuz + çocuk havuzu', 'Kids club (4-12 yaş)', 'Ultra her şey dahil içecek', 'Spa & wellness merkezi'],
      included: ['2 gece konaklama', 'Açık büfe kahvaltı-öğle-akşam', 'Seçili alkolsüz ve alkollü içecekler', 'Havuz + kumsal kullanımı', 'Kids club', 'Wi-Fi'],
      notIncluded: ['Konaklama vergisi', 'A la carte restoranlar', 'Spa masaj seansları', 'Su sporları (özel kiralık)', 'Odada premium mini-bar'],
      howToUse: ['Rezervasyon için arayın. Temmuz-Ağustos arası yüksek sezon olabilir.'],
      terms:
        '• Yüksek sezon (15 Tem - 31 Ağu) kampanya dışıdır.\n' +
        '• Rezervasyon iptali 21 gün önce.\n' +
        '• 4 yaş altı çocuk ücretsiz, 12 yaş altı %50.\n' +
        '• Evcil hayvan kabul edilmez.',
      faq: [
        { question: 'Yüksek sezonda fiyat farkı var mı?', answer: '15 Tem-31 Ağu kampanya dışı; bu tarihler için ayrı teklif alınır.' },
        { question: 'Oda servisi dahil mi?', answer: 'Kahvaltı oda servisi ücretsiz; ana öğünler a la carte.' },
      ],
    },
  },
  {
    id: 'asana-yoga',
    title: 'Asana Yoga & Pilates — Aylık Sınırsız Üyelik',
    description:
      'Bostanlı\'da deniz manzaralı stüdyoda sınırsız grup dersleri: Hatha, Vinyasa, Ashtanga, Yin yoga, Reformer Pilates, Mat Pilates, Barre. Hafta içi günde 8 seans, hafta sonu 5 seans. 30 gün boyunca sınırsız katılım + 1 özel PT seansı (Reformer). Deneyimli eğitmenler (200h+ RYT sertifikalı). Soyunma odaları, duş, lockerlar.',
    shortDescription:
      'Bostanlı deniz manzaralı stüdyoda 30 gün sınırsız yoga + pilates + 1 özel seans.',
    businessId: 'izmir-yoga',
    businessName: 'Asana Yoga & Pilates',
    cityId: 'izmir', district: 'Karşıyaka', categoryId: 'spor',
    price: 890, originalPrice: 1600, rating: 4.8,
    images: [IMG('photo-1544367567-0f2fcb009e0b', 16)],
    isFeatured: false, daysLeft: 22,
    packages: [
      { name: '30 Gün Sınırsız', description: 'Tüm grup dersler + 1 özel seans', price: 890, originalPrice: 1600, quota: 40, soldCount: 16, isDefault: true },
      { name: '8 Ders Paketi (Esnek)', description: '60 gün içinde 8 ders kullanımı', price: 560, originalPrice: 960, quota: 30, soldCount: 3 },
    ],
    content: {
      highlights: ['Deniz manzaralı stüdyo', '7 farklı ders türü', '200h+ RYT eğitmenler', 'Mat ve malzemeler dahil', 'Mobil uygulamadan ders seçimi'],
      included: ['Sınırsız grup ders (30 gün)', '1 özel Reformer seansı', 'Mat, blok, kemer', 'Duş + locker'],
      notIncluded: ['Özel PT paketleri', 'Özel masaj hizmetleri'],
      howToUse: [
        'Kuponu satın aldıktan sonra stüdyoya gelip üyelik formunu doldurun.',
        'Mobil uygulamadan (Asana App) dersleri rezerve edin.',
      ],
      terms:
        '• Üyelik başladığı tarihten itibaren 30 gün geçerlidir.\n' +
        '• Dondurma / devir yok.\n' +
        '• İlk derse 10 dk önce gelin.',
      faq: [
        { question: 'Hiç yoga yapmadım, başlangıç dersi var mı?', answer: 'Evet, her gün "Beginner Friendly Hatha" dersimiz var.' },
        { question: 'Hamile yogası var mı?', answer: 'Çarşamba 18:00 prenatal yoga dersimiz var.' },
      ],
    },
  },
  // ── Antalya ──────────────────────────────────────────────────────
  {
    id: 'lara-beach-paket',
    title: 'Lara Beach Resort & Spa — Ultra Her Şey Dahil (3 Gün)',
    description:
      'Lara Turizm Alanı\'nda denize sıfır 5 yıldızlı Lara Beach Resort & Spa\'da 2 kişi 3 gün ultra her şey dahil konsept. Kahvaltı-öğle-akşam açık büfe, 6 a la carte restoran (haftada 1 kez ücretsiz), tüm alkollü ve alkolsüz içecekler, 24 saat snack bar, plaj kullanımı, 4 havuz, su kaydırakları, spa & fitness, animasyon. 9 dk Antalya havalimanına.',
    shortDescription:
      'Lara\'da 5★ resort, 3 gün ultra her şey dahil + a la carte + spa kredisi.',
    businessId: 'lara-beach',
    businessName: 'Lara Beach Resort & Spa',
    cityId: 'antalya', district: 'Muratpaşa', categoryId: 'seyahat',
    price: 9800, originalPrice: 15000, rating: 4.9,
    images: [IMG('photo-1520250497591-112f2f40a3f4', 17)],
    isFeatured: true, daysLeft: 60,
    packages: [
      { name: '2 Kişi - Standart Oda (3 Gün)', description: 'Ultra her şey dahil, bahçe manzaralı', price: 9800, originalPrice: 15000, quota: 20, soldCount: 6, isDefault: true },
      { name: '2 Kişi - Deluxe Deniz Manzaralı', description: 'Deniz manzaralı + 2500₺ spa kredisi', price: 12500, originalPrice: 19500, quota: 10, soldCount: 3 },
      { name: '2+2 Aile Süiti', description: '2 yetişkin + 2 çocuk, ultra her şey dahil', price: 14800, originalPrice: 22000, quota: 8, soldCount: 1 },
    ],
    content: {
      highlights: ['Denize sıfır konum', '4 havuz + su kaydırakları', '6 a la carte restoran', 'Spa & wellness merkezi', 'Animasyon ve eğlence programı'],
      included: ['3 gün konaklama', 'Ultra her şey dahil konsept', 'A la carte restoran (haftada 1)', 'Plaj + havuz kullanımı', 'Kids club', 'Wi-Fi'],
      notIncluded: ['Konaklama vergisi', 'Premium marka alkol', 'Spa masaj (Deluxe paket hariç)', 'Aqua park ücretli aktiviteler'],
      howToUse: ['Rezervasyon için arayın; yüksek sezonda erken rezervasyon önerilir.'],
      terms:
        '• Yüksek sezon (1 Tem - 31 Ağu) tarih kısıtlaması olabilir.\n' +
        '• 6 yaş altı ücretsiz, 12 yaş altı %50.\n' +
        '• İptal 21 gün öncesinden.',
      faq: [
        { question: 'Transfer hizmeti var mı?', answer: 'Havalimanı transferi ek ücretlidir (350₺ tek yön).' },
        { question: 'Evcil hayvan?', answer: 'Küçük ırk köpekler ek ücretle kabul edilir.' },
      ],
    },
  },
  {
    id: 'kaleici-meyhane',
    title: 'Kaleiçi Meyhanesi — Geleneksel Meze Ziyafeti (2 Kişi)',
    description:
      'Tarihi Kaleiçi\'nde Hıdırlık Sokak\'taki taş binada Kaleiçi Meyhanesi\'nde 2 kişilik geleneksel meyhane deneyimi. 12 çeşit meze (haydari, acılı ezme, fava, topik, ahtapot salatası, patlıcan salatası, enginar, zeytinyağlı pazı, midye pilaki, humus, kısır, beyaz peynir), ızgara balık (çupra veya levrek) ve ev yapımı rakı ikramı (küçük boy). Canlı fasıl Cuma-Cumartesi akşamları.',
    shortDescription:
      'Kaleiçi\'nde tarihi meyhane, 12 meze + ızgara balık + rakı ikramı. Fasıl Cuma-Cumartesi.',
    businessId: 'kaleici-meyhane',
    businessName: 'Kaleiçi Meyhanesi',
    cityId: 'antalya', district: 'Muratpaşa', categoryId: 'restoran',
    price: 890, originalPrice: 1350, rating: 4.7,
    images: [IMG('photo-1555396273-367ea4eb4db5', 18)],
    isFeatured: false, daysLeft: 30,
    packages: [
      { name: '2 Kişi - Klasik', description: '12 meze + ızgara balık + 1 ikram rakı', price: 890, originalPrice: 1350, quota: 60, soldCount: 18, isDefault: true },
      { name: '2 Kişi - Fasıl Gecesi', description: 'Klasik + Cuma/Cumartesi fasıl masası garantisi', price: 1100, originalPrice: 1700, quota: 25, soldCount: 6 },
    ],
    content: {
      highlights: ['Tarihi Kaleiçi atmosferi', '12 çeşit meze', 'Günlük taze ızgara balık', 'Canlı fasıl (Cu-Ct)', 'Taş avlu masaları'],
      included: ['12 meze tabağı', 'Izgara levrek veya çupra (2 kişilik)', '1 ikram rakı (küçük)', 'Ekmek, salata, sebze'],
      notIncluded: ['Ek rakı / içecek', 'Premium balık (barbun, kalkan)', 'Tatlı'],
      howToUse: ['Rezervasyon için arayın; fasıl gecesi 3 gün önce.'],
      terms:
        '• Pazar kapalı.\n' +
        '• Fasıl yalnızca Cuma-Cumartesi.\n' +
        '• Balık türü günlük müsaitliğe göre değişir.',
      faq: [
        { question: 'Fasıl masası garantisi ne demek?', answer: 'Fasıl sahnesine en yakın masalar bu paket için ayrılır.' },
        { question: 'Alkol içmiyoruz, alternatif var mı?', answer: 'Taze sıkılmış şerbet veya çay ile değiştirilir.' },
      ],
    },
  },
  {
    id: 'core-fitness',
    title: 'Core Fitness Club — Aylık Sınırsız Üyelik + 2 PT',
    description:
      'Konyaaltı\'da Core Fitness Club\'da 30 gün sınırsız giriş. 2.000 m² alan, Technogym kardio cihazları, serbest ağırlık bölümü, 3 stüdyo (BodyPump, Spinning, Yoga), kapalı havuz, sauna, buhar odası, 2 squash kortu. 2 özel PT seansı (kişiye özel program çıkarımı). Özel dolap, havlu servisi, duş şampuanları dahil.',
    shortDescription:
      'Premium fitness kulübü, 30 gün sınırsız + 2 PT seansı + havuz + squash.',
    businessId: 'antalya-fitness',
    businessName: 'Core Fitness Club',
    cityId: 'antalya', district: 'Konyaaltı', categoryId: 'spor',
    price: 699, originalPrice: 1200, rating: 4.6,
    images: [IMG('photo-1534438327276-14e5300c3a48', 19)],
    quota: 0, soldCount: 45, isFeatured: false, daysLeft: 45,
    packages: [
      { name: '30 Gün Sınırsız + 2 PT', description: 'Tüm tesisler + 2 kişisel eğitim seansı', price: 699, originalPrice: 1200, quota: 0, soldCount: 28, isDefault: true },
      { name: '30 Gün + 6 PT', description: '6 PT ile yoğun program için', price: 1250, originalPrice: 2400, quota: 30, soldCount: 8 },
      { name: '3 Aylık Üyelik', description: '3 ay sınırsız + 6 PT + beslenme danışmanlığı', price: 2200, originalPrice: 3600, quota: 20, soldCount: 5 },
    ],
    content: {
      highlights: ['2.000 m² tesis', 'Technogym cihazlar', '3 grup ders stüdyosu', 'Kapalı havuz + sauna', '2 squash kortu', 'Havlu servisi'],
      included: ['30 gün sınırsız giriş', '2 özel PT seansı (yeni paketler için 6 PT)', 'Havuz + sauna + buhar', 'Havlu, dolap', 'Grup dersleri'],
      notIncluded: ['Besin desteği ürünleri', 'Ekstra PT seansları', 'Spa masaj hizmetleri'],
      howToUse: [
        'Kuponu aldıktan sonra tesise gelin.',
        'Resepsiyonda üyelik formunu doldurun (kimlik + 1 fotoğraf).',
        'PT seansları için eğitmenle randevu alın.',
      ],
      terms:
        '• Üyelik başladıktan sonra dondurulamaz.\n' +
        '• 16 yaş altı ebeveyn onayı gerekir.\n' +
        '• Misafir getirme hakkı yok.',
      faq: [
        { question: 'Havlu ve terlik dahil mi?', answer: 'Havlu dahil; terlik kendinizin olmalı.' },
        { question: 'Tesise kaçta girebilirim?', answer: 'Pzt-Cum 06:00-23:00, Ct-Paz 08:00-22:00.' },
      ],
    },
  },
  // ── Eskişehir ────────────────────────────────────────────────────
  {
    id: 'odunpazari-kahvalti',
    title: 'Odunpazarı Köşkü — Tarihi Konakta Kahvaltı (2 Kişi)',
    description:
      'Odunpazarı\'nın tarihi taş konaklarından Odunpazarı Köşkü\'nde 2 kişilik zengin Eskişehir kahvaltısı. Bölgenin klasik lezzetleri: çilbir (Eskişehir usulü yoğurtlu yumurta), taş fırın sac böreği, ev yapımı reçeller (dut, kuşburnu, gül), Odunpazarı peyniri, taze çiğdem böreği, közlenmiş domates-biber, sınırsız Türk çayı. Konağın bahçe kısmı Atlıhan Sokak\'a bakar.',
    shortDescription:
      'Odunpazarı tarihi konakta Eskişehir kahvaltısı — çilbir, sac böreği, ev reçelleri.',
    businessId: 'odunpazari-cafe',
    businessName: 'Odunpazarı Köşkü',
    cityId: 'eskisehir', district: 'Odunpazarı', categoryId: 'restoran',
    price: 380, originalPrice: 600, rating: 4.7,
    images: [IMG('photo-1482049016688-2d3e1b311543', 20)],
    isFeatured: false, daysLeft: 18,
    packages: [
      { name: '2 Kişi Standart Kahvaltı', description: 'Tam tabak + sınırsız çay', price: 380, originalPrice: 600, quota: 80, soldCount: 30, isDefault: true },
      { name: '4 Kişi Aile Masası', description: 'Genişletilmiş menü + 4 çilbir + taze ekmek', price: 720, originalPrice: 1200, quota: 20, soldCount: 4 },
    ],
    content: {
      highlights: ['Tarihi Odunpazarı konağı', 'Eskişehir usulü çilbir', 'Taş fırın sac böreği', '3 ev yapımı reçel', 'Bahçe masaları'],
      included: ['Eskişehir kahvaltı tabağı', 'Çilbir (Eskişehir usulü)', 'Taş fırın sac böreği', 'Sınırsız Türk çayı', 'Ev yapımı ekmek'],
      notIncluded: ['Türk kahvesi', 'Taze meyve suyu', 'Özel siparişler'],
      howToUse: ['Hafta sonu rezervasyon önerilir.'],
      terms:
        '• Hafta sonu yoğunluğu nedeniyle bekleme olabilir.\n' +
        '• Kış aylarında bahçe bölümü kapalıdır.\n' +
        '• Çocuk sandalyesi ücretsiz.',
      faq: [
        { question: 'Çilbir nedir?', answer: 'Haşlanmış yumurta + sarımsaklı yoğurt + kızarmış tereyağı sosu; Eskişehir usulü baharatlıdır.' },
        { question: 'Otopark var mı?', answer: 'Konağın önünde ücretsiz sokak parkı (yoğun günlerde zor).' },
      ],
    },
  },
  {
    id: 'eski-termal',
    title: 'Termal Wellness Center — Tam Gün Termal + Masaj',
    description:
      'Hamamyolu Sokak\'ta Termal Wellness Center\'da Eskişehir\'in ünlü termal sularıyla tam gün kullanım. 3 termal havuz (38°C, 42°C, 45°C), kapalı hamam (kese + köpük dahil), buhar odası, sauna, dinlenme salonu. Sonrasında 60 dk klasik İsveç masajı. Gün boyunca açık büfe çay ikramı ve meyve tabağı.',
    shortDescription:
      'Eskişehir termal sularında tam gün + hamam + 60 dk klasik masaj + çay ikramı.',
    businessId: 'eski-wellness',
    businessName: 'Termal Wellness Center',
    cityId: 'eskisehir', district: 'Tepebaşı', categoryId: 'wellness',
    price: 520, originalPrice: 850, rating: 4.8,
    images: [IMG('photo-1540555700478-4be289fbecef', 21)],
    isFeatured: true, daysLeft: 35,
    packages: [
      { name: 'Tam Gün + 60 dk Masaj', description: 'Termal havuz + hamam + masaj', price: 520, originalPrice: 850, quota: 80, soldCount: 32, isDefault: true },
      { name: 'Tam Gün + 90 dk Premium Masaj', description: 'Termal havuz + hamam + 90 dk aromaterapi masaj', price: 780, originalPrice: 1250, quota: 40, soldCount: 9 },
      { name: 'Çiftler Paketi', description: 'İki kişilik, özel kabin masaj', price: 1200, originalPrice: 1900, quota: 20, soldCount: 5 },
    ],
    content: {
      highlights: ['3 termal havuz (38-42-45°C)', 'Eskişehir termal suyu', 'Kese + köpük dahil hamam', 'Dinlenme salonu + açık büfe çay', 'Çiftler özel kabin'],
      included: ['Tam gün tesis kullanımı', 'Peştemal, takunya, lif', 'Kese + köpük', '60 dk klasik masaj', 'Çay + meyve ikramı'],
      notIncluded: ['Premium masaj upgrade', 'Spa cilt bakımı', 'Yemek menüsü'],
      howToUse: [
        'Rezervasyon için arayın.',
        'Mayo veya mayo şort gereklidir.',
        'Seansa 20 dk önce gelin.',
      ],
      terms:
        '• Kronik hastalıklar (kalp, tansiyon) için seans öncesi doktor onayı önerilir.\n' +
        '• Açlık / tokluk durumunda 45+°C havuza girilmemelidir.\n' +
        '• Hamilelik durumunda uygun değildir.',
      faq: [
        { question: 'Saatlerce kalabilir miyim?', answer: 'Evet, tam gün paket 09:00-21:00 arası sınırsız giriş-çıkış.' },
        { question: 'Mayo satılıyor mu?', answer: 'Evet, hijyenik paketli mayo / şort resepsiyonda mevcut.' },
      ],
    },
  },
  // ── İstanbul — Eğlence (Tiyatro) ─────────────────────────────────
  {
    id: 'kalan-hayatimin-ilk-gunu',
    title: '"Bugün Kalan Hayatımın İlk Günü" Tiyatro Oyunu',
    description:
      'Geçmişin yükü, kayıplar ve pişmanlıklarla yüzleşen bir karakterin iç dünyasına tanıklık ederken; umudun, tesadüflerin ve küçük karşılaşmaların insan hayatını nasıl dönüştürebileceği sahnede adım adım izleniyor.\n\n' +
      'Tek bir oyuncunun performansıyla, kahramanın zihninde dolaşan düşünceler, anılar ve hayali diyaloglar canlı bir anlatıma dönüşüyor. Oyun, seyirciyi hem duygusal hem de umut dolu bir yolculuğa davet ederek şu soruyu soruyor: "Eğer bugün kalan hayatımızın ilk günü olsaydı, neyi farklı yapardık?"\n\n' +
      'Etkinlik Türü: Dram, Tek Kişilik Oyun\n' +
      'Süre: 50 dakika\n' +
      'Yaş Sınırı: 14+\n' +
      'Mekan: Bakırköy Aydem Sahne',
    shortDescription:
      'Geçmişle yüzleşen bir karakterin içsel yolculuğunu sahneye taşıyan etkileyici bir dram. 2 seans, 4 bilet seçeneği.',
    businessId: 'bakirkoy-aydem',
    businessName: 'Bakırköy Aydem Sahne',
    cityId: 'istanbul', district: 'Bakırköy', categoryId: 'eglence',
    price: 200, originalPrice: 250, rating: 4.8,
    images: [
      IMG('photo-1503095396549-807759245b35', 22), // tiyatro sahnesi
      IMG('photo-1507924538820-ede94a04019d', 23),
    ],
    isFeatured: true, daysLeft: 24,
    packages: [
      {
        name: '10 Mayıs 2026 · 18:15 · Öğrenci Bileti',
        description: 'Bakırköy Aydem Sahne — oturma planı rezervasyona göre otomatik',
        price: 200, originalPrice: 250, quota: 80, soldCount: 32, isDefault: true,
      },
      {
        name: '10 Mayıs 2026 · 18:15 · Tam Bilet',
        description: 'Bakırköy Aydem Sahne — oturma planı rezervasyona göre otomatik',
        price: 320, originalPrice: 400, quota: 120, soldCount: 54,
      },
      {
        name: '19 Mayıs 2026 · 16:00 · Öğrenci Bileti',
        description: 'Bakırköy Aydem Sahne — oturma planı rezervasyona göre otomatik',
        price: 200, originalPrice: 250, quota: 80, soldCount: 11,
      },
      {
        name: '19 Mayıs 2026 · 16:00 · Tam Bilet',
        description: 'Bakırköy Aydem Sahne — oturma planı rezervasyona göre otomatik',
        price: 320, originalPrice: 400, quota: 120, soldCount: 27,
      },
    ],
    content: {
      highlights: [
        'Tek kişilik güçlü dram performansı',
        '2 farklı seans, 4 bilet seçeneği',
        'Öğrenci indirimli bilet seçenekleri',
        '50 dakikalık yoğun anlatım',
        'Bakırköy Aydem Sahne — merkezi konum',
      ],
      included: [
        'Seçtiğiniz tarih ve saatte 1 kişilik bilet',
        'Oyun süresince sahne kullanımı',
        'Program broşürü',
      ],
      notIncluded: [
        'Yiyecek / içecek ikramı',
        'Otopark',
        'Oyun dışı etkinlikler',
      ],
      howToUse: [
        'Kuponu satın alın, panelinizdeki kodu kaydedin.',
        'Etkinlik gününden 1 saat önce Bakırköy Aydem Sahne gişesine gidin.',
        'Gişede kupon kodunuzu gösterip fiziksel biletinizi alın.',
        'Öğrenci bileti aldıysanız öğrenci belgenizi yanınızda bulundurun.',
        'Oyun başlamadan 15 dk önce salona girişinizi tamamlayın.',
      ],
      terms:
        '• Rezervasyon gerekmemektedir. Biletlerinizi etkinlikten 1 saat önce gişeden alabilirsiniz.\n' +
        '• Oturma planı rezervasyon durumuna göre otomatik olarak belirlenmektedir.\n' +
        '• Alınan biletlerde iade, iptal ve değişiklik yapılamaz.\n' +
        '• Hizmete ilişkin biletinizi etkinlik mekanından istemeyi unutmayınız.\n' +
        '• Öğrenci bileti için geçerli öğrenci belgesi ibrazı zorunludur.\n' +
        '• 14 yaş altı izleyici alınmamaktadır.\n' +
        '• Oyun başladıktan sonra salona giriş yapılamaz.',
      faq: [
        { question: 'Rezervasyon yapmam gerekiyor mu?', answer: 'Hayır. Biletinizi satın aldıktan sonra etkinlik günü 1 saat önce gişeden fiziksel biletinizi alabilirsiniz.' },
        { question: 'Koltuğumu seçebiliyor muyum?', answer: 'Hayır, oturma planı rezervasyon sırasına göre otomatik atanır; erken gelen önde oturur.' },
        { question: 'Öğrenci bileti için ne gerekli?', answer: 'Geçerli öğrenci kimliği veya öğrenci belgesi gişede ibraz edilmelidir. Aksi halde tam bilet farkı talep edilir.' },
        { question: 'Biletimi iptal edebilir miyim?', answer: 'Hayır, satın alınan biletlerde iade, iptal ve değişiklik yapılamaz.' },
        { question: '12 yaşındaki çocuğumu getirebilir miyim?', answer: 'Üzgünüz, oyun 14 yaş ve üzerine uygundur; daha küçük izleyici alınmaz.' },
        { question: 'Geç kaldım, girebilir miyim?', answer: 'Oyun başladıktan sonra salona giriş yapılmamaktadır; geç gelenler için iade de sağlanmaz.' },
      ],
    },
    location: {
      address: 'Cevizlik, İzzet Molla Sk. No:4/A, 34142 Bakırköy/İstanbul',
      district: 'Bakırköy',
      phone: '+90 212 555 00 00',
      workingHours: 'Gişe: Etkinlik günü 17:00\'dan itibaren açık',
      mapUrl: 'https://maps.google.com/?q=Bakırköy+Aydem+Sahne',
    },
    paymentInfo: {
      maxInstallments: 6,
      installmentNote: 'Etkinlik biletlerinde 3 taksit komisyonsuzdur.',
    },
    cancellation:
      'Etkinlik biletlerinde iade, iptal ve değişiklik yapılamaz. Bilet satın alındıktan sonra hiçbir koşulda para iadesi sağlanmaz.',
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

function makePackageId(campaignId, idx) {
  return `pkg-${campaignId}-${idx}`;
}

/**
 * Kampanyanın kendi `packages` dizisi varsa onu kullan; yoksa
 * eski price/originalPrice/quota/soldCount'tan tek paket türet.
 */
function buildPackages(c) {
  if (Array.isArray(c.packages) && c.packages.length) {
    return c.packages.map((p, i) => ({
      id: makePackageId(c.id, i),
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      originalPrice: p.originalPrice,
      quota: p.quota ?? 0,
      soldCount: p.soldCount ?? 0,
      isDefault: !!p.isDefault || (i === 0 && !c.packages.some((x) => x.isDefault)),
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
  // Kampanya kendine özel içerik verdiyse onu tercih et, kalanlar için
  // kategori fallback'i kullan.
  const categoryContent = CONTENT_BY_CATEGORY[c.categoryId] ?? DEFAULT_CONTENT;
  const ov = c.content ?? {};
  const content = {
    highlights: ov.highlights ?? categoryContent.highlights,
    included: ov.included ?? categoryContent.included,
    notIncluded: ov.notIncluded ?? categoryContent.notIncluded,
    howToUse: ov.howToUse ?? categoryContent.howToUse,
    terms: ov.terms ?? categoryContent.terms,
    faq: ov.faq ?? categoryContent.faq,
  };

  const packages = buildPackages(c);
  const aggregates = computeAggregates(packages);
  const biz = businessesById[c.businessId];

  // Kısa açıklama: kampanya vermişse kendi; yoksa ilk cümle / max 160 karakter
  const shortDesc =
    c.shortDescription ??
    (c.description.length <= 160
      ? c.description
      : c.description.split('.')[0] + '.');

  // Konum: kampanyanın özel location'ı varsa onu, yoksa işletme default'u
  const location = c.location
    ? { ...locationFor(biz), ...c.location }
    : locationFor(biz);

  const paymentInfo = c.paymentInfo ?? {
    maxInstallments: 9,
    installmentNote: '3 taksit komisyonsuz.',
  };

  const cancellation = c.cancellation ?? DEFAULT_CANCELLATION;

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
    images: expandGallery(c),

    packages,
    ...aggregates,

    highlights: content.highlights,
    included: content.included,
    notIncluded: content.notIncluded,
    howToUse: content.howToUse,
    terms: content.terms,
    faq: content.faq,
    cancellation,

    location,
    paymentInfo,

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
