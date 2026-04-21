import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const ALLOWED_ROLES = ['user', 'business', 'admin'];

/**
 * setUserRole — Bir kullanıcıya rol atar (custom claim + Firestore senkron).
 *
 * Yalnızca admin claim'ine sahip kullanıcılar çağırabilir.
 *
 * Girdi:
 *   { targetUid: string, role: 'user' | 'business' | 'admin' }
 *
 * Çıktı:
 *   { success: true, uid, role }
 */
export const setUserRole = onCall(
  { region: 'europe-west1' },
  async (request) => {
    // ─── Yetki kontrolü ────────────────────────────────────────────
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Giriş yapılmamış.');
    }
    if (request.auth.token.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Yalnızca admin rol atayabilir.');
    }

    // ─── Girdi doğrulama ───────────────────────────────────────────
    const { targetUid, role } = request.data ?? {};

    if (typeof targetUid !== 'string' || targetUid.length === 0) {
      throw new HttpsError('invalid-argument', 'Geçersiz targetUid.');
    }
    if (!ALLOWED_ROLES.includes(role)) {
      throw new HttpsError(
        'invalid-argument',
        `role şunlardan biri olmalı: ${ALLOWED_ROLES.join(', ')}`
      );
    }

    // ─── Custom claim atama ────────────────────────────────────────
    const auth = getAuth();
    const existing = await auth.getUser(targetUid); // yoksa hata fırlatır
    const currentClaims = existing.customClaims ?? {};

    await auth.setCustomUserClaims(targetUid, { ...currentClaims, role });

    // ─── Firestore users dokümanını senkron et ─────────────────────
    const db = getFirestore();
    await db.collection('users').doc(targetUid).set(
      {
        role,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { success: true, uid: targetUid, role };
  }
);
