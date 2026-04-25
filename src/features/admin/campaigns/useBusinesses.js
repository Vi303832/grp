import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * Form'daki "İşletme" select'i için kullanılır.
 */
export function useBusinesses() {
  return useQuery({
    queryKey: ['admin', 'businesses'],
    queryFn: async () => {
      const q = query(collection(db, 'businesses'), orderBy('name', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 5 * 60 * 1000,
  });
}
