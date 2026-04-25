import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { getUserCoupons } from '../../lib/api/coupons';

export function useUserCoupons() {
  const userId = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: ['user', 'coupons', userId],
    queryFn: () => getUserCoupons(userId),
    enabled: !!userId,
  });
}
