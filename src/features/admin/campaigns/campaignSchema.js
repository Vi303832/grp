import { z } from 'zod';

/**
 * Admin kampanya formu için Zod şeması.
 * `images` ayrı state ile yönetilir (upload akışı), bu yüzden şemada yer almaz.
 */

const packageSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(2, 'Paket adı en az 2 karakter olmalı.')
    .max(120, 'Paket adı en fazla 120 karakter olabilir.'),
  description: z.string().max(400, 'Paket açıklaması çok uzun.').optional().default(''),
  price: z.coerce
    .number({ invalid_type_error: 'Geçerli bir fiyat girin.' })
    .positive('Fiyat sıfırdan büyük olmalı.'),
  originalPrice: z.coerce
    .number({ invalid_type_error: 'Geçerli bir fiyat girin.' })
    .positive('Orijinal fiyat sıfırdan büyük olmalı.'),
  quota: z.coerce
    .number({ invalid_type_error: 'Kota bir sayı olmalı.' })
    .int('Kota tam sayı olmalı.')
    .min(0, 'Kota 0 veya daha büyük olmalı.')
    .default(0),
  isDefault: z.boolean().default(false),
}).refine((p) => p.originalPrice >= p.price, {
  path: ['originalPrice'],
  message: 'Orijinal fiyat, satış fiyatından düşük olamaz.',
});

const faqSchema = z.object({
  question: z.string().min(3, 'Soru en az 3 karakter olmalı.'),
  answer: z.string().min(3, 'Cevap en az 3 karakter olmalı.'),
});

const locationSchema = z.object({
  address: z.string().max(400).optional().default(''),
  district: z.string().max(120).optional().default(''),
  phone: z.string().max(40).optional().default(''),
  workingHours: z.string().max(120).optional().default(''),
  mapUrl: z
    .string()
    .url('Geçerli bir URL girin.')
    .or(z.literal(''))
    .optional()
    .default(''),
});

const paymentInfoSchema = z.object({
  maxInstallments: z.coerce
    .number()
    .int()
    .min(1, 'En az 1 taksit olmalı.')
    .max(12, 'En fazla 12 taksit.')
    .default(1),
  installmentNote: z.string().max(200).optional().default(''),
});

export const campaignSchema = z.object({
  // ─── Temel
  title: z
    .string()
    .min(3, 'Başlık en az 3 karakter olmalı.')
    .max(120, 'Başlık en fazla 120 karakter olabilir.'),
  slug: z
    .string()
    .min(3, 'Slug en az 3 karakter olmalı.')
    .regex(/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir.'),
  shortDescription: z
    .string()
    .min(10, 'Kısa açıklama en az 10 karakter olmalı.')
    .max(200, 'Kısa açıklama 200 karakteri geçemez.'),
  description: z
    .string()
    .min(20, 'Açıklama en az 20 karakter olmalı.')
    .max(8000, 'Açıklama çok uzun.'),

  businessId: z.string().min(1, 'İşletme seçin.'),
  cityId: z.string().min(1, 'Şehir seçin.'),
  categoryId: z.string().min(1, 'Kategori seçin.'),

  // ─── Paketler (en az 1)
  packages: z.array(packageSchema).min(1, 'En az bir paket eklemelisiniz.'),

  // ─── Zengin içerik
  highlights: z.array(z.string().min(1)).max(10).default([]),
  included: z.array(z.string().min(1)).max(20).default([]),
  notIncluded: z.array(z.string().min(1)).max(20).default([]),
  howToUse: z.array(z.string().min(1)).max(10).default([]),
  terms: z.string().max(8000).optional().default(''),
  faq: z.array(faqSchema).max(20).default([]),
  cancellation: z.string().max(2000).optional().default(''),

  // ─── Konum & Ödeme
  location: locationSchema.default({}),
  paymentInfo: paymentInfoSchema.default({ maxInstallments: 1 }),

  // ─── Yayın
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  expiresAt: z.string().min(1, 'Son kullanım tarihi seçin.'),
});

export const DEFAULT_PACKAGE = () => ({
  id: `pkg-${Math.random().toString(36).slice(2, 10)}`,
  name: '1 Kişilik Paket',
  description: '',
  price: 0,
  originalPrice: 0,
  quota: 0,
  isDefault: true,
});

export const DEFAULT_VALUES = {
  title: '',
  slug: '',
  shortDescription: '',
  description: '',
  businessId: '',
  cityId: 'bursa',
  categoryId: '',
  packages: [DEFAULT_PACKAGE()],
  highlights: [],
  included: [],
  notIncluded: [],
  howToUse: [],
  terms: '',
  faq: [],
  cancellation: '',
  location: {
    address: '',
    district: '',
    phone: '',
    workingHours: '',
    mapUrl: '',
  },
  paymentInfo: {
    maxInstallments: 3,
    installmentNote: '',
  },
  isActive: true,
  isFeatured: false,
  expiresAt: '',
};

/**
 * Paketlerden denormalized top-level alanları hesaplar.
 * Firestore kaydı bu alanları saklar → listeleme/sorting/filtre için hızlı.
 */
export function computeCampaignAggregates(packages = []) {
  if (!packages.length) {
    return {
      minPrice: 0,
      maxOriginalPrice: 0,
      totalQuota: 0,
      totalSold: 0,
    };
  }
  const prices = packages.map((p) => Number(p.price) || 0);
  const originals = packages.map((p) => Number(p.originalPrice) || 0);
  const totalQuota = packages.reduce(
    (sum, p) => sum + (Number(p.quota) || 0),
    0,
  );
  const totalSold = packages.reduce(
    (sum, p) => sum + (Number(p.soldCount) || 0),
    0,
  );
  return {
    minPrice: Math.min(...prices),
    maxOriginalPrice: Math.max(...originals),
    totalQuota,
    totalSold,
  };
}

/**
 * Türkçe başlıktan URL-safe slug üretir.
 */
export function slugify(text = '') {
  const map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };
  return text
    .toLowerCase()
    .replace(/[çğıöşü]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function newPackageId() {
  return `pkg-${Math.random().toString(36).slice(2, 10)}`;
}
