import { useMutation } from '@tanstack/react-query';
import { validateCoupon, useCoupon } from '../../lib/api/coupons';

/**
 * İşletme paneli için kupon doğrulama mutation'u.
 *
 *   const mutation = useValidateCouponMutation();
 *   mutation.mutate(code, { onSuccess: (data) => ... });
 */
export function useValidateCouponMutation() {
  return useMutation({
    mutationFn: validateCoupon,
  });
}

/**
 * İşletme paneli için kupon kullanma mutation'u.
 */
export function useUseCouponMutation() {
  return useMutation({
    mutationFn: useCoupon,
  });
}
