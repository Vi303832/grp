import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';

function normalize(d) {
  const data = d.data();
  return {
    id: d.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    usedAt: data.usedAt?.toDate?.() ?? null,
    expiresAt: data.expiresAt?.toDate?.() ?? null,
  };
}

export async function getUserCoupons(userId) {
  const q = query(
    collection(db, 'coupons'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(normalize);
}

/**
 * İşletme kupon doğrulama (okuma).
 * @returns {Promise<{ coupon: { id, code, status, campaignId, expiresAt, usedAt } }>}
 */
export async function validateCoupon(code) {
  const callable = httpsCallable(functions, 'validateCoupon');
  const result = await callable({ code });
  return result.data;
}

/**
 * İşletme kupon kullanma (yazma).
 */
export async function useCoupon(code) {
  const callable = httpsCallable(functions, 'useCoupon');
  const result = await callable({ code });
  return result.data;
}

/**
 * Admin manuel kupon iptali.
 */
export async function cancelCoupon(couponId, reason) {
  const callable = httpsCallable(functions, 'cancelCoupon');
  const result = await callable({ couponId, reason });
  return result.data;
}
