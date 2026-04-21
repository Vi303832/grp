import { useQuery } from '@tanstack/react-query';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * Tüm şehirleri getirir. Aktif olanları `order` alanına göre sıralar.
 *
 * Composite index gerekmesin diye sıralama/filtreleme client-side yapılır —
 * şehir sayısı az (~10) olduğundan tamamen güvenli.
 */
export function useCities() {
  return useQuery({
    queryKey: ['cities', 'active'],
    queryFn: async () => {
      const snap = await getDocs(collection(db, 'cities'));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((c) => c.isActive !== false)
        .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    },
    staleTime: 1000 * 60 * 30,
  });
}
