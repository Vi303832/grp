import { getFirestore } from 'firebase-admin/firestore';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 0/O/1/I karıştırmayı önle
const CODE_LENGTH = 6;
const PREFIX = 'GRP-';
const MAX_ATTEMPTS = 8;

function randomSegment() {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

/**
 * Benzersiz bir kupon kodu üretir (GRP-XXXXXX).
 * Çakışma olursa birkaç kez yeniden dener.
 *
 * ÖNEMLİ: Sadece internal kullanım — HTTP endpoint değil.
 */
export async function generateCouponCode() {
  const db = getFirestore();
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = `${PREFIX}${randomSegment()}`;
    const existing = await db
      .collection('coupons')
      .where('code', '==', code)
      .limit(1)
      .get();
    if (existing.empty) return code;
  }
  throw new Error('Kupon kodu üretilemedi (çok fazla çakışma).');
}
