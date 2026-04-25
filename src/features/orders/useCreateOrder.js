import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOrder } from '../../lib/api/orders';

/**
 * Sipariş oluştur + iyzico ödeme akışı başlat.
 *
 * Kullanım (frontend developer için):
 *
 *   const { mutate, isPending } = useCreateOrder();
 *   mutate(
 *     { campaignId, quantity: 1 },
 *     {
 *       onSuccess: ({ paymentPageUrl }) => {
 *         // iyzico sayfasına yönlendir
 *         window.location.href = paymentPageUrl;
 *       },
 *     }
 *   );
 */
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user', 'orders'] });
    },
  });
}
