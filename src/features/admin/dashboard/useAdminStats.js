import { useQuery } from '@tanstack/react-query';
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../../lib/firebase';

async function fetchStats() {
  const campaignsCol = collection(db, 'campaigns');
  const applicationsCol = collection(db, 'applications');
  const couponsCol = collection(db, 'coupons');
  const ordersCol = collection(db, 'orders');

  const since = Timestamp.fromDate(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  );

  const [
    activeCampaignsSnap,
    pendingApplicationsSnap,
    activeCouponsSnap,
    recentOrdersSnap,
  ] = await Promise.all([
    getCountFromServer(query(campaignsCol, where('isActive', '==', true))),
    getCountFromServer(query(applicationsCol, where('status', '==', 'pending'))),
    getCountFromServer(query(couponsCol, where('status', '==', 'active'))),
    getCountFromServer(query(ordersCol, where('createdAt', '>=', since))),
  ]);

  return {
    activeCampaigns: activeCampaignsSnap.data().count,
    pendingApplications: pendingApplicationsSnap.data().count,
    activeCoupons: activeCouponsSnap.data().count,
    recentOrders: recentOrdersSnap.data().count,
  };
}

async function fetchRecentOrders() {
  const q = query(
    collection(db, 'orders'),
    orderBy('createdAt', 'desc'),
    limit(5),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function fetchRecentApplications() {
  const q = query(
    collection(db, 'applications'),
    orderBy('createdAt', 'desc'),
    limit(5),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
    staleTime: 60_000,
  });
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: fetchRecentOrders,
    staleTime: 60_000,
  });
}

export function useRecentApplications() {
  return useQuery({
    queryKey: ['admin', 'recent-applications'],
    queryFn: fetchRecentApplications,
    staleTime: 60_000,
  });
}
