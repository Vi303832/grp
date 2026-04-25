import { initializeApp } from 'firebase-admin/app';

initializeApp();

// ─── Auth / Rol yönetimi ─────────────────────────────────────────────
export { setUserRole } from './src/auth/setUserRole.js';

// ─── Sipariş & Ödeme ─────────────────────────────────────────────────
export { createOrder } from './src/orders/createOrder.js';
export { iyzicoWebhook } from './src/payments/iyzicoWebhook.js';

// ─── Kupon ───────────────────────────────────────────────────────────
export { validateCoupon } from './src/coupons/validateCoupon.js';
export { useCoupon } from './src/coupons/useCoupon.js';
export { cancelCoupon } from './src/coupons/cancelCoupon.js';

// ─── Email ───────────────────────────────────────────────────────────
export { sendOrderEmail } from './src/emails/sendOrderEmail.js';
