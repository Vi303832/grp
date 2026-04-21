import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

/**
 * Firestore kampanya dokümanını normalize eder
 * (Timestamp → Date, id dahil)
 */
function normalize(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    expiresAt: data.expiresAt?.toDate?.() ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

/**
 * Kampanyaları filtreli şekilde listeler.
 *
 * Options:
 *   - cityId?: string         (default: "bursa")
 *   - categoryId?: string     ("all" / undefined → filtre yok)
 *   - onlyFeatured?: boolean
 *   - max?: number            (default: 50)
 */
export function useCampaigns({
  cityId = 'bursa',
  categoryId,
  onlyFeatured = false,
  max = 50,
} = {}) {
  return useQuery({
    queryKey: ['campaigns', { cityId, categoryId, onlyFeatured, max }],
    queryFn: async () => {
      const constraints = [
        where('isActive', '==', true),
        where('cityId', '==', cityId),
      ];

      if (categoryId && categoryId !== 'all') {
        constraints.push(where('categoryId', '==', categoryId));
      }
      if (onlyFeatured) {
        constraints.push(where('isFeatured', '==', true));
      }

      constraints.push(orderBy('createdAt', 'desc'));
      constraints.push(limit(max));

      const q = query(collection(db, 'campaigns'), ...constraints);
      const snap = await getDocs(q);
      return snap.docs.map(normalize);
    },
  });
}

/**
 * Ana sayfada kullanılan öne çıkan kampanyalar.
 * useCampaigns üzerine hafif bir sarmalayıcı.
 */
export function useFeaturedCampaigns({ cityId = 'bursa', max = 6 } = {}) {
  return useCampaigns({ cityId, onlyFeatured: true, max });
}

/**
 * Bir şehir için TÜM aktif kampanyaları tek seferde getirir.
 * Ana sayfada client-side filtreleme (kategori + arama) için kullanılır.
 * Böylece her kategori/arama değişikliğinde Firestore'a yeni istek atılmaz.
 *
 * Query key sadece cityId'ye bağlı olduğundan aynı şehir için cache paylaşılır.
 */
export function useActiveCampaigns({ cityId = 'bursa', max = 200 } = {}) {
  return useCampaigns({ cityId, max });
}
