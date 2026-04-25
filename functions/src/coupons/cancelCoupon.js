import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

/**
 * cancelCoupon — Admin manuel kupon iptali.
 * Admin panelindeki "İptal Et" butonu bu fonksiyonu çağırır.
 *
 * Girdi: { couponId: string, reason?: string }
 */
export const cancelCoupon = onCall(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Sadece admin iptal edebilir.');
    }
    const { couponId, reason } = request.data ?? {};
    if (typeof couponId !== 'string' || !couponId) {
      throw new HttpsError('invalid-argument', 'Geçersiz couponId.');
    }

    const db = getFirestore();
    const ref = db.collection('coupons').doc(couponId);
    const snap = await ref.get();
    if (!snap.exists) {
      throw new HttpsError('not-found', 'Kupon bulunamadı.');
    }
    if (snap.data().status === 'used') {
      throw new HttpsError(
        'failed-precondition',
        'Kullanılmış kupon iptal edilemez.',
      );
    }

    await ref.update({
      status: 'cancelled',
      cancelReason: reason ?? null,
      cancelledBy: request.auth.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);
