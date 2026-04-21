/**
 * İlk admin kullanıcıyı atar (chicken-and-egg çözümü).
 *
 * Kullanım:
 *   node scripts/setAdminClaim.mjs <uid-veya-email>
 *
 * Örnek:
 *   node scripts/setAdminClaim.mjs admin@luna-grp.com
 *   node scripts/setAdminClaim.mjs aBcDeFgHiJkLmNoP
 *
 * Gereklilikler:
 *   - GOOGLE_APPLICATION_CREDENTIALS ortam değişkeni Firebase Admin servis
 *     hesabı JSON dosyasına işaret etmeli
 *     (Firebase Console → Project settings → Service accounts → Generate new private key)
 *
 * Çalıştırdıktan sonra kullanıcının çıkış yapıp tekrar giriş yapması
 * (ya da client'ta auth.currentUser.getIdToken(true) çağrılması) gerekir.
 */

import { initializeApp, cert, applicationDefault, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? applicationDefault()
      : applicationDefault(),
  });
}

const auth = getAuth();
const db = getFirestore();

async function resolveUid(identifier) {
  if (identifier.includes('@')) {
    const user = await auth.getUserByEmail(identifier);
    return user.uid;
  }
  const user = await auth.getUser(identifier);
  return user.uid;
}

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error('❌ Kullanım: node scripts/setAdminClaim.mjs <uid-veya-email>');
    process.exit(1);
  }

  const uid = await resolveUid(identifier);
  const existing = await auth.getUser(uid);
  const currentClaims = existing.customClaims ?? {};

  await auth.setCustomUserClaims(uid, { ...currentClaims, role: 'admin' });

  await db.collection('users').doc(uid).set(
    {
      role: 'admin',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log(`✅ ${identifier} (uid: ${uid}) artık admin.`);
  console.log('   Kullanıcı tekrar giriş yapınca claim aktif olur.');
}

main().catch((err) => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
