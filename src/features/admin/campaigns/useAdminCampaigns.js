import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytesResumable,
} from 'firebase/storage';
import { db, storage } from '../../../lib/firebase';
import { computeCampaignAggregates } from './campaignSchema';

function normalize(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    expiresAt: data.expiresAt?.toDate?.() ?? null,
    createdAt: data.createdAt?.toDate?.() ?? null,
    updatedAt: data.updatedAt?.toDate?.() ?? null,
  };
}

// ─── Queries ─────────────────────────────────────────────────────────────

/**
 * Admin için tüm kampanyaları listeler (aktif + pasif).
 */
export function useAdminCampaigns() {
  return useQuery({
    queryKey: ['admin', 'campaigns'],
    queryFn: async () => {
      const q = query(
        collection(db, 'campaigns'),
        orderBy('createdAt', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map(normalize);
    },
    staleTime: 30_000,
  });
}

export function useAdminCampaign(id) {
  return useQuery({
    queryKey: ['admin', 'campaigns', id],
    queryFn: async () => {
      const snap = await getDoc(doc(db, 'campaigns', id));
      if (!snap.exists()) return null;
      return normalize(snap);
    },
    enabled: !!id,
  });
}

/**
 * Slug'ın benzersizliğini kontrol eder. Düzenleme modunda kendi id'sini hariç tutar.
 */
export async function isSlugAvailable(slug, ignoreId = null) {
  const snap = await getDocs(
    query(collection(db, 'campaigns'), where('slug', '==', slug)),
  );
  if (snap.empty) return true;
  if (ignoreId && snap.docs.every((d) => d.id === ignoreId)) return true;
  return false;
}

// ─── Mutations ───────────────────────────────────────────────────────────

/**
 * Form verisini Firestore şemasına dönüştürür.
 * Paketlerden denormalized (minPrice, totalQuota vs.) alanları hesaplar.
 */
function toFirestorePayload(values, { preservePackageSold } = {}) {
  // Paketleri temizle ve soldCount'u koru (edit modunda)
  const packages = (values.packages ?? []).map((p) => {
    const existing = preservePackageSold?.[p.id];
    return {
      id: p.id,
      name: p.name.trim(),
      description: (p.description ?? '').trim(),
      price: Number(p.price),
      originalPrice: Number(p.originalPrice),
      quota: Number(p.quota) || 0,
      soldCount: existing ?? Number(p.soldCount ?? 0),
      isDefault: !!p.isDefault,
    };
  });

  // Tam olarak bir tanesi isDefault olmalı — garanti altına al
  if (!packages.some((p) => p.isDefault) && packages.length) {
    packages[0].isDefault = true;
  }

  const aggregates = computeCampaignAggregates(packages);

  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    shortDescription: values.shortDescription.trim(),
    description: values.description.trim(),

    businessId: values.businessId,
    cityId: values.cityId,
    categoryId: values.categoryId,

    packages,
    ...aggregates,

    highlights: (values.highlights ?? []).map((s) => s.trim()).filter(Boolean),
    included: (values.included ?? []).map((s) => s.trim()).filter(Boolean),
    notIncluded: (values.notIncluded ?? []).map((s) => s.trim()).filter(Boolean),
    howToUse: (values.howToUse ?? []).map((s) => s.trim()).filter(Boolean),
    terms: (values.terms ?? '').trim(),
    faq: (values.faq ?? []).map((q) => ({
      question: q.question.trim(),
      answer: q.answer.trim(),
    })),
    cancellation: (values.cancellation ?? '').trim(),

    location: {
      address: (values.location?.address ?? '').trim(),
      district: (values.location?.district ?? '').trim(),
      phone: (values.location?.phone ?? '').trim(),
      workingHours: (values.location?.workingHours ?? '').trim(),
      mapUrl: (values.location?.mapUrl ?? '').trim(),
    },
    paymentInfo: {
      maxInstallments: Number(values.paymentInfo?.maxInstallments) || 1,
      installmentNote: (values.paymentInfo?.installmentNote ?? '').trim(),
    },

    isActive: !!values.isActive,
    isFeatured: !!values.isFeatured,
    expiresAt: values.expiresAt
      ? Timestamp.fromDate(new Date(values.expiresAt))
      : null,
  };
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, images = [] }) => {
      const payload = {
        ...toFirestorePayload(values),
        images,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'campaigns'), payload);
      return ref.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values, images, existingPackages }) => {
      // Mevcut paketlerin soldCount'larını koru (admin panelden değiştirilemez).
      const preservePackageSold = {};
      (existingPackages ?? []).forEach((p) => {
        preservePackageSold[p.id] = p.soldCount ?? 0;
      });

      const payload = {
        ...toFirestorePayload(values, { preservePackageSold }),
        updatedAt: serverTimestamp(),
      };
      if (images) payload.images = images;
      await updateDoc(doc(db, 'campaigns', id), payload);
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns', id] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, images = [] }) => {
      // Storage temizliği (varsa)
      await Promise.allSettled(
        images
          .filter((url) => typeof url === 'string' && url.includes('firebase'))
          .map((url) => {
            try {
              const path = decodeURIComponent(
                url.split('/o/')[1]?.split('?')[0] ?? '',
              );
              return path ? deleteObject(storageRef(storage, path)) : null;
            } catch {
              return null;
            }
          }),
      );
      await deleteDoc(doc(db, 'campaigns', id));
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'campaigns'] });
      qc.invalidateQueries({ queryKey: ['campaigns'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

// ─── Storage upload ──────────────────────────────────────────────────────

/**
 * Tek bir görseli Firebase Storage'a yükler. Progress callback destekler.
 * Dönüş: { url, path }
 */
export function uploadCampaignImage(file, { onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `campaigns/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    const ref = storageRef(storage, path);
    const task = uploadBytesResumable(ref, file, {
      contentType: file.type || 'image/jpeg',
    });
    task.on(
      'state_changed',
      (snap) => {
        if (onProgress) {
          onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100));
        }
      },
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve({ url, path });
      },
    );
  });
}
