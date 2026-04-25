import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../store/authStore';
import { getUserOrders } from '../../lib/api/orders';

export function useUserOrders() {
  const userId = useAuthStore((s) => s.user?.uid);
  return useQuery({
    queryKey: ['user', 'orders', userId],
    queryFn: () => getUserOrders(userId),
    enabled: !!userId,
  });
}
