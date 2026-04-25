import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * validateCoupon — İşletmenin kupon doğrulama çağrısı.
 *
 * - Sadece `business` veya `admin` rolü çağırabilir.
 * - İşletme, kendi `businessId`'sine ait olmayan kuponu doğrulayamaz.
 * - Kupon bulunursa durum bilgisi döner; `useCoupon` ayrı çağrı ile yapılır.
 *
 * Girdi:  { code: string }
 * Çıktı:  { coupon: { id, code, status, campaignId, expiresAt, usedAt } }
 */
export const validateCoupon = onCall(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Giriş yapılmamış.');
    }
    const role = request.auth.token.role;
    if (role !== 'business' && role !== 'admin') {
      throw new HttpsError('permission-denied', 'Yetkisiz erişim.');
    }

    const { code } = request.data ?? {};
    if (typeof code !== 'string' || !code.trim()) {
      throw new HttpsError('invalid-argument', 'Geçersiz kod.');
    }

    const db = getFirestore();
    const snap = await db
      .collection('coupons')
      .where('code', '==', code.trim().toUpperCase())
      .limit(1)
      .get();

    if (snap.empty) {
      throw new HttpsError('not-found', 'Kupon bulunamadı.');
    }

    const doc = snap.docs[0];
    const coupon = doc.data();

    // İşletme izolasyonu — admin hariç
    if (role === 'business' && coupon.businessId !== request.auth.uid) {
      throw new HttpsError(
        'permission-denied',
        'Bu kupon sizin işletmenize ait değil.',
      );
    }

    // Süresi dolmuş mu otomatik güncelleme (opsiyonel)
    const expired =
      coupon.expiresAt && coupon.expiresAt.toDate() < new Date();

    return {
      coupon: {
        id: doc.id,
        code: coupon.code,
        status: expired && coupon.status === 'active' ? 'expired' : coupon.status,
        campaignId: coupon.campaignId,
        businessId: coupon.businessId,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.toDate().toISOString() : null,
        usedAt: coupon.usedAt ? coupon.usedAt.toDate().toISOString() : null,
      },
    };
  }
);
