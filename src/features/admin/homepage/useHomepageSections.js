import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

function normalize(d) {
  return { id: d.id, ...d.data() };
}

export function useHomepageSections() {
  return useQuery({
    queryKey: ['admin', 'homepage-sections'],
    queryFn: async () => {
      const q = query(
        collection(db, 'homepage_sections'),
        orderBy('order', 'asc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map(normalize);
    },
  });
}

export function useCreateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values) => {
      const existing = await getDocs(collection(db, 'homepage_sections'));
      const nextOrder = existing.size;
      const ref = await addDoc(collection(db, 'homepage_sections'), {
        title: values.title,
        slug: values.slug,
        isActive: values.isActive ?? true,
        campaignIds: values.campaignIds ?? [],
        order: nextOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'homepage-sections'] });
    },
  });
}

export function useUpdateSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }) => {
      await updateDoc(doc(db, 'homepage_sections', id), {
        ...values,
        updatedAt: serverTimestamp(),
      });
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'homepage-sections'] });
    },
  });
}

export function useDeleteSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      await deleteDoc(doc(db, 'homepage_sections', id));
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'homepage-sections'] });
    },
  });
}

/**
 * Bölüm sıralamasını toplu günceller. Sırada bir kaydırma olduğunda kullanılır.
 */
export function useReorderSections() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sections) => {
      const batch = writeBatch(db);
      sections.forEach((s, idx) => {
        batch.update(doc(db, 'homepage_sections', s.id), {
          order: idx,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'homepage-sections'] });
    },
  });
}
