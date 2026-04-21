/**
 * Mevcut Firebase Auth kullanıcılarını listeler.
 * Kullanım: node scripts/listUsers.mjs
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) initializeApp();

const auth = getAuth();
const { users } = await auth.listUsers(1000);

if (users.length === 0) {
  console.log('ℹ️  Hiç kullanıcı yok.');
  process.exit(0);
}

console.log(`📋 ${users.length} kullanıcı:\n`);
for (const u of users) {
  const role = u.customClaims?.role ?? '(rolsüz)';
  console.log(`  • ${u.email ?? '(email yok)'}  —  uid: ${u.uid}  —  role: ${role}`);
}
