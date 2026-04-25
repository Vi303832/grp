import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

/**
 * sendOrderEmail — Sipariş "coupon_issued" durumuna geçtiğinde kullanıcıya
 * kupon kodunu içeren email gönderir.
 *
 * Trigger: orders/{orderId} update
 * Provider: Resend (TODO: RESEND_API_KEY env ile entegre et)
 */
export const sendOrderEmail = onDocumentUpdated(
  { document: 'orders/{orderId}', region: 'europe-west1' },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const transitionedToCouponIssued =
      before.status !== 'coupon_issued' && after.status === 'coupon_issued';

    if (!transitionedToCouponIssued) return;

    const orderId = event.params.orderId;
    const db = getFirestore();

    // Kullanıcı bilgisi
    const userSnap = await db.collection('users').doc(after.userId).get();
    const user = userSnap.exists ? userSnap.data() : null;
    if (!user?.email) {
      logger.warn('sendOrderEmail: kullanıcı email yok', { orderId });
      return;
    }

    // Kuponları topla
    const couponsSnap = await db
      .collection('coupons')
      .where('orderId', '==', orderId)
      .get();
    const couponCodes = couponsSnap.docs.map((d) => d.data().code);

    // Kampanya bilgisi
    const campaignSnap = await db
      .collection('campaigns')
      .doc(after.campaignId)
      .get();
    const campaign = campaignSnap.exists ? campaignSnap.data() : null;

    const payload = {
      to: user.email,
      subject: `Kuponunuz hazır: ${campaign?.title ?? 'GRP Kampanya'}`,
      html: renderHtml({
        displayName: user.displayName,
        campaignTitle: campaign?.title,
        couponCodes,
        expiresAt: campaign?.expiresAt?.toDate?.(),
      }),
    };

    // TODO(backend): Resend entegrasyonu.
    //   import { Resend } from 'resend';
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({ from: 'GRP <no-reply@grpkampanya.com>', ...payload });
    logger.info('[MOCK EMAIL]', payload);
  }
);

function renderHtml({ displayName, campaignTitle, couponCodes, expiresAt }) {
  const codesHtml = couponCodes
    .map(
      (c) =>
        `<div style="font-family:monospace;font-size:20px;background:#f0f4f8;padding:12px 16px;border-radius:8px;letter-spacing:2px;margin:8px 0;">${c}</div>`,
    )
    .join('');
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#171c1f;">
      <h1 style="color:#1a146b;">Merhaba ${displayName ?? ''},</h1>
      <p><strong>${campaignTitle ?? 'Kampanya'}</strong> için satın alma işleminiz başarıyla tamamlandı.</p>
      <p>Kupon kodlarınız:</p>
      ${codesHtml}
      ${expiresAt ? `<p>Son kullanım: ${expiresAt.toLocaleDateString('tr-TR')}</p>` : ''}
      <p style="color:#5a5b71;font-size:13px;margin-top:24px;">GRP Kampanya · Bursa</p>
    </div>
  `;
}
