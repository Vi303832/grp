import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * Tüm kategorileri order'a göre sıralı getirir.
 * Sonuç uzun süreli cache'lenir (kategoriler nadiren değişir).
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    },
    staleTime: 1000 * 60 * 30,
  });
}
