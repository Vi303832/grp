import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  doc,
  getDoc,
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
    paidAt: data.paidAt?.toDate?.() ?? null,
  };
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(normalize);
    },
  });
}

export function useAdminOrder(id) {
  return useQuery({
    queryKey: ['admin', 'orders', id],
    enabled: !!id,
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'orders', id));
      return snap.exists() ? normalize(snap) : null;
    },
  });
}

/**
 * Manuel sipariş durumu güncelleme (admin override).
 * Normal akışta Cloud Functions üzerinden yapılır.
 */
export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      await updateDoc(doc(db, 'orders', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      return { id, status };
    },
    onSuccess: ({ id }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'orders', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'recent-orders'] });
    },
  });
}
