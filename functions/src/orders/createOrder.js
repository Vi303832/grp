import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions/v2';

/**
 * createOrder — Sipariş oluştur ve iyzico ödeme başlat.
 *
 * Akış:
 *   1. Auth kontrolü
 *   2. Kampanya + seçilen PAKET stok kontrolü (transaction)
 *   3. `orders/{id}` → status: 'pending' (packageId + packageSnapshot saklanır)
 *   4. iyzico CheckoutForm init → token dön
 *   5. Client ödeme formuna yönlendirilir
 *   6. iyzico webhook ödeme onayını bildirir (`iyzicoWebhook`)
 *
 * Girdi: {
 *   campaignId: string,
 *   packageId?: string       // çok paketli kampanyalarda zorunlu, tek paketlide default alınır
 *   quantity?: number        // 1-10
 *   installments?: number    // 1-12 (iyzico'ya geçirilir)
 * }
 * Çıktı: { orderId, paymentPageUrl, paymentToken }
 */
export const createOrder = onCall(
  { region: 'europe-west1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Giriş yapılmamış.');
    }

    const {
      campaignId,
      packageId,
      quantity = 1,
      installments = 1,
    } = request.data ?? {};

    if (typeof campaignId !== 'string' || !campaignId) {
      throw new HttpsError('invalid-argument', 'Geçersiz campaignId.');
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new HttpsError('invalid-argument', 'quantity 1-10 arası olmalı.');
    }
    if (!Number.isInteger(installments) || installments < 1 || installments > 12) {
      throw new HttpsError('invalid-argument', 'installments 1-12 arası olmalı.');
    }

    const db = getFirestore();
    const userId = request.auth.uid;

    const orderRef = db.collection('orders').doc();
    const orderData = await db.runTransaction(async (tx) => {
      const campaignSnap = await tx.get(
        db.collection('campaigns').doc(campaignId),
      );
      if (!campaignSnap.exists) {
        throw new HttpsError('not-found', 'Kampanya bulunamadı.');
      }
      const campaign = campaignSnap.data();

      if (!campaign.isActive) {
        throw new HttpsError('failed-precondition', 'Kampanya aktif değil.');
      }
      if (campaign.expiresAt && campaign.expiresAt.toDate() < new Date()) {
        throw new HttpsError(
          'failed-precondition',
          'Kampanyanın süresi dolmuş.',
        );
      }

      // ─── Paket seç & stok kontrol ─────────────────────────────────
      const packages = Array.isArray(campaign.packages) ? campaign.packages : [];

      let selectedIndex = -1;
      let selectedPackage = null;

      if (packages.length > 0) {
        if (packageId) {
          selectedIndex = packages.findIndex((p) => p.id === packageId);
          if (selectedIndex === -1) {
            throw new HttpsError('not-found', 'Seçilen paket bulunamadı.');
          }
        } else {
          selectedIndex = packages.findIndex((p) => p.isDefault);
          if (selectedIndex === -1) selectedIndex = 0;
        }
        selectedPackage = packages[selectedIndex];

        if (
          selectedPackage.quota &&
          selectedPackage.quota > 0 &&
          (selectedPackage.soldCount ?? 0) + quantity > selectedPackage.quota
        ) {
          throw new HttpsError(
            'resource-exhausted',
            'Seçilen paketin stoğu yetersiz.',
          );
        }
      } else {
        // Legacy: paket yoksa top-level price/quota
        if (
          campaign.quota &&
          campaign.quota > 0 &&
          (campaign.soldCount ?? 0) + quantity > campaign.quota
        ) {
          throw new HttpsError('resource-exhausted', 'Kampanya stoğu yetersiz.');
        }
        selectedPackage = {
          id: 'legacy',
          name: campaign.title,
          description: '',
          price: campaign.price,
          originalPrice: campaign.originalPrice ?? campaign.price,
          quota: campaign.quota ?? 0,
          soldCount: campaign.soldCount ?? 0,
        };
      }

      const unitPrice = Number(selectedPackage.price);
      const amount = unitPrice * quantity;

      const payload = {
        userId,
        campaignId,
        businessId: campaign.businessId,
        cityId: campaign.cityId,

        // Paket bilgileri — audit & webhook için snapshot olarak tutulur
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        packageSnapshot: {
          id: selectedPackage.id,
          name: selectedPackage.name,
          description: selectedPackage.description ?? '',
          price: unitPrice,
          originalPrice: Number(selectedPackage.originalPrice) || unitPrice,
        },

        quantity,
        unitPrice,
        amount,
        installments,

        status: 'pending',
        paymentId: null,
        paymentToken: null,
        createdAt: FieldValue.serverTimestamp(),
        paidAt: null,
      };

      tx.set(orderRef, payload);
      return { ...payload, id: orderRef.id, campaign };
    });

    // ─── iyzico ödeme başlat (TODO: gerçek entegrasyon) ────────────
    // TODO(backend): iyzipay-node paketiyle CheckoutForm.initialize çağır.
    //   - paymentGroup: 'PRODUCT'
    //   - basketItems: [{ id, name: packageName, category1, itemType, price }]
    //   - buyer: user profili (Firestore users doc'undan)
    //   - callbackUrl: https://<app>/api/iyzico/webhook
    //   - conversationId: orderRef.id
    //   - enabledInstallments: [installments] ya da [1,2,3,6,9] üst sınır
    const mockPaymentToken = `MOCK-${orderRef.id}`;
    const mockPaymentUrl = `/odeme-sonucu?orderId=${orderRef.id}&success=true`;

    await orderRef.update({ paymentToken: mockPaymentToken });

    logger.info('Order created', {
      orderId: orderRef.id,
      userId,
      packageId: orderData.packageId,
      amount: orderData.amount,
      installments,
    });

    return {
      orderId: orderRef.id,
      paymentPageUrl: mockPaymentUrl,
      paymentToken: mockPaymentToken,
    };
  },
);
