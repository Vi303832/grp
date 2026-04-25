import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../../../lib/firebase';

function normalize(d) {
  const data = d.data();
  return {
    uid: d.id,
    ...data,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(200),
      );
      const snap = await getDocs(q);
      return snap.docs.map(normalize);
    },
  });
}

/**
 * Cloud Function `setUserRole` çağrısı.
 * Hedef kullanıcının custom claim'ini ve Firestore doc'unu günceller.
 */
export function useSetUserRole() {
  const qc = useQueryClient();
  const callable = httpsCallable(functions, 'setUserRole');
  return useMutation({
    mutationFn: async ({ targetUid, role }) => {
      const result = await callable({ targetUid, role });
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
