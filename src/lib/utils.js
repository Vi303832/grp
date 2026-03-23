/**
 * CSS sınıflarını birleştirir (Tailwind ile güvenli kullanım için)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Fiyatı Türk Lirası formatında gösterir: 149,90 ₺
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * İndirim yüzdesini hesaplar
 */
export function discountPercent(original, sale) {
  if (!original || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Verilen tarihi "3 gün kaldı" gibi Türkçe ifadeye çevirir
 */
export function timeLeft(date) {
  const diff = new Date(date) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Süresi doldu';
  if (days === 1) return '1 gün kaldı';
  return `${days} gün kaldı`;
}

/**
 * Firebase Timestamp veya Date nesnesini "GG.AA.YYYY" formatına çevirir
 */
export function formatDate(value) {
  if (!value) return '';
  const date = value?.toDate ? value.toDate() : new Date(value);
  return date.toLocaleDateString('tr-TR');
}
