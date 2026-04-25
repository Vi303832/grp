import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';
import { generateCouponCode } from '../coupons/generateCouponCode.js';

/**
 * iyzicoWebhook — iyzico ödeme sonucu bildirimi (server-to-server).
 *
 * Akış:
 *   1. Webhook imza doğrulaması (TODO)
 *   2. Sipariş bul (paymentToken veya conversationId)
 *   3. Ödeme başarılıysa:
 *        - order.status = 'paid' → sonra 'coupon_issued'
 *        - kampanya soldCount++ (transaction)
 *        - coupons/{id} oluştur
 *   4. Başarısızsa: order.status = 'cancelled'
 *
 * NOT: Şu an mock. Demo için `POST /iyzicoWebhook` ile
 *      { orderId, status: 'success' | 'failure' } kabul edilir.
 */
export const iyzicoWebhook = onRequest(
  { region: 'europe-west1', cors: false },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // TODO(backend): iyzico imza doğrulaması (X-IYZ-SIGNATURE header).
    // TODO(backend): Gerçek payload şemasını uygula (paymentId, paymentStatus, token).

    const { orderId, status } = req.body ?? {};
    if (!orderId) {
      res.status(400).json({ error: 'orderId gerekli.' });
      return;
    }

    const db = getFirestore();
    const orderRef = db.collection('orders').doc(orderId);

    try {
      await db.runTransaction(async (tx) => {
        const orderSnap = await tx.get(orderRef);
        if (!orderSnap.exists) throw new Error('Sipariş bulunamadı.');

        const order = orderSnap.data();
        if (order.status !== 'pending') {
          // idempotent — daha önce işlenmiş
          return;
        }

        if (status !== 'success') {
          tx.update(orderRef, {
            status: 'cancelled',
            updatedAt: FieldValue.serverTimestamp(),
          });
          return;
        }

        // Kampanya satış sayısını artır — hem paket seviyesinde hem de
        // denormalized `totalSold` üzerinden.
        const campaignRef = db.collection('campaigns').doc(order.campaignId);
        const campaignSnap = await tx.get(campaignRef);
        if (!campaignSnap.exists) throw new Error('Kampanya bulunamadı.');

        const campaign = campaignSnap.data();
        const qty = order.quantity ?? 1;
        const updates = {
          totalSold: FieldValue.increment(qty),
          updatedAt: FieldValue.serverTimestamp(),
        };

        // Legacy destek: eski kampanyalarda top-level soldCount var.
        if (!Array.isArray(campaign.packages) || campaign.packages.length === 0) {
          updates.soldCount = FieldValue.increment(qty);
        } else if (order.packageId) {
          // Packages dizisini yerinde güncelle.
          const nextPackages = campaign.packages.map((p) =>
            p.id === order.packageId
              ? { ...p, soldCount: (p.soldCount ?? 0) + qty }
              : p,
          );
          updates.packages = nextPackages;
        }

        tx.update(campaignRef, updates);

        tx.update(orderRef, {
          status: 'paid',
          paidAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      // Ödeme başarılıysa kupon(ları) üret
      const freshOrder = (await orderRef.get()).data();
      if (freshOrder.status === 'paid') {
        const campaignSnap = await db
          .collection('campaigns')
          .doc(freshOrder.campaignId)
          .get();
        const campaign = campaignSnap.data();

        const expiresAt = campaign.expiresAt ?? null;
        const quantity = freshOrder.quantity ?? 1;
        const batch = db.batch();

        for (let i = 0; i < quantity; i++) {
          const code = await generateCouponCode();
          const couponRef = db.collection('coupons').doc();
          batch.set(couponRef, {
            code,
            orderId: freshOrder ? orderRef.id : null,
            userId: freshOrder.userId,
            campaignId: freshOrder.campaignId,
            businessId: freshOrder.businessId,
            status: 'active',
            usedAt: null,
            expiresAt,
            createdAt: FieldValue.serverTimestamp(),
          });
        }

        batch.update(orderRef, {
          status: 'coupon_issued',
          updatedAt: FieldValue.serverTimestamp(),
        });

        await batch.commit();
        logger.info('Coupons issued', {
          orderId: orderRef.id,
          quantity,
        });
      }

      res.json({ ok: true });
    } catch (err) {
      logger.error('iyzicoWebhook error', err);
      res.status(500).json({ error: err.message });
    }
  }
);
