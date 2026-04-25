import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

/**
 * useCoupon — Kuponu "kullanıldı" işaretler.
 *
 * - Transaction ile race condition önlenir.
 * - İşletme sadece kendi kuponunu kullanabilir.
 *
 * Girdi: { code: string }
 * Çıktı: { success: true, couponId }
 */
export const useCoupon = onCall(
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

    const couponRef = snap.docs[0].ref;

    await db.runTransaction(async (tx) => {
      const current = await tx.get(couponRef);
      const data = current.data();

      if (role === 'business' && data.businessId !== request.auth.uid) {
        throw new HttpsError(
          'permission-denied',
          'Bu kupon sizin işletmenize ait değil.',
        );
      }
      if (data.status !== 'active') {
        throw new HttpsError(
          'failed-precondition',
          `Kupon durumu: ${data.status}. Kullanılamaz.`,
        );
      }
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        throw new HttpsError('failed-precondition', 'Kupon süresi dolmuş.');
      }

      tx.update(couponRef, {
        status: 'used',
        usedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    return { success: true, couponId: couponRef.id };
  }
);
