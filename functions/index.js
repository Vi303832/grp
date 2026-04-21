import { initializeApp } from 'firebase-admin/app';

initializeApp();

// ─── Auth / Rol yönetimi ─────────────────────────────────────────────
export { setUserRole } from './src/auth/setUserRole.js';
