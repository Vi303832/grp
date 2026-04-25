import { Badge } from '../../../components/ui';

const ORDER_VARIANTS = {
  pending: { variant: 'warning', label: 'Beklemede' },
  paid: { variant: 'info', label: 'Ödendi' },
  coupon_issued: { variant: 'success', label: 'Kupon Üretildi' },
  cancelled: { variant: 'danger', label: 'İptal' },
  refunded: { variant: 'default', label: 'İade' },
};

const COUPON_VARIANTS = {
  active: { variant: 'success', label: 'Aktif' },
  used: { variant: 'info', label: 'Kullanıldı' },
  expired: { variant: 'default', label: 'Süresi Doldu' },
  cancelled: { variant: 'danger', label: 'İptal' },
};

const APPLICATION_VARIANTS = {
  pending: { variant: 'warning', label: 'Yeni' },
  reviewed: { variant: 'info', label: 'İncelendi' },
  approved: { variant: 'success', label: 'Onaylandı' },
  rejected: { variant: 'danger', label: 'Reddedildi' },
};

const MAP = {
  order: ORDER_VARIANTS,
  coupon: COUPON_VARIANTS,
  application: APPLICATION_VARIANTS,
};

export default function StatusBadge({ type, status }) {
  const config = MAP[type]?.[status];
  if (!config) return <Badge>{status}</Badge>;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
