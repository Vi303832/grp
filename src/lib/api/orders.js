import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';

function normalize(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    paidAt: data.paidAt?.toDate?.() ?? null,
  };
}

/**
 * Cloud Function çağrısı — `createOrder`.
 * iyzico ödeme formu URL'si döner; client bu URL'e yönlendirilmeli.
 *
 * @returns {Promise<{ orderId: string, paymentPageUrl: string, paymentToken: string }>}
 */
export async function createOrder({
  campaignId,
  packageId,
  quantity = 1,
  installments = 1,
}) {
  const callable = httpsCallable(functions, 'createOrder');
  const result = await callable({ campaignId, packageId, quantity, installments });
  return result.data;
}

export async function getUserOrders(userId) {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(normalize);
}

export async function getOrderById(id) {
  const snap = await getDoc(doc(db, 'orders', id));
  return snap.exists() ? normalize(snap) : null;
}
