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
  };
}

export function useAdminApplications() {
  return useQuery({
    queryKey: ['admin', 'applications'],
    queryFn: async () => {
      const q = query(
        collection(db, 'applications'),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map(normalize);
    },
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, adminNote }) => {
      const payload = {
        status,
        updatedAt: serverTimestamp(),
      };
      if (adminNote !== undefined) payload.adminNote = adminNote;
      await updateDoc(doc(db, 'applications', id), payload);
      return { id, status };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'applications'] });
      qc.invalidateQueries({ queryKey: ['admin', 'recent-applications'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}
