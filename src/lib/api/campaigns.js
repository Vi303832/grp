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
 */
export async function getCampaignBySlug(slug) {
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
