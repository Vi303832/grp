import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

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

export function useAdminCoupons() {
  return useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      const q = query(
        collection(db, 'coupons'),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map(normalize);
    },
  });
}

/**
 * Admin manuel kupon iptali.
 * Normal akışta bu mümkün değil (rules `allow update: if false`),
 * bu yüzden Cloud Function üzerinden yapılmalı. Bu hook,
 * ileride `cancelCoupon` Cloud Function'ına bağlanacak.
 *
 * Şimdilik admin SDK senkron mutation ile çalışıyor (rules güncellemesi gerekir).
 * TODO(backend): Bunu `httpsCallable('cancelCoupon')` çağrısına dönüştür.
 */
export function useCancelCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      await updateDoc(doc(db, 'coupons', id), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
