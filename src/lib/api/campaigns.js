import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

function normalize(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    expiresAt: data.expiresAt?.toDate?.() ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
  };
}

/**
 * Slug ile kampanya getirir. Kampanya detay sayfası için.
 * Çoğu kampanyada doc ID = slug olduğu için önce hızlı doc lookup yapar,
 * bulunmazsa `slug` alanına göre sorgu yapar (özelleştirilmiş slug desteği).
 */
export async function getCampaignBySlug(slug) {
  if (!slug) return null;

  // 1) Hızlı yol: Doc ID ile doğrudan çek.
  try {
    const direct = await getDoc(doc(db, 'campaigns', slug));
    if (direct.exists()) {
      const data = normalize(direct);
      if (data.isActive !== false) return data;
    }
  } catch {
    // permission-denied olabilir, fallback sorguya düşsün.
  }

  // 2) Fallback: slug alanına göre sorgu (admin panelinde özel slug girilirse).
  const q = query(
    collection(db, 'campaigns'),
    where('slug', '==', slug),
    limit(1),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return normalize(snap.docs[0]);
}

export async function getCampaignById(id) {
  const snap = await getDoc(doc(db, 'campaigns', id));
  return snap.exists() ? normalize(snap) : null;
}
