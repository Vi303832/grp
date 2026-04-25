import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import { Button, Card, CardBody, Spinner } from '../../components/ui';
import { getOrderById } from '../../lib/api/orders';

/**
 * DEMO — iyzico callback'i burada karşılanır.
 * Gerçek akışta Cloud Function webhook sipariş durumunu güncellemiş olur,
 * kullanıcı bu sayfada sonucu görür.
 *
 * Şimdilik mock: URL'deki `orderId` ile siparişi okur ve durum bilgisini gösterir.
 */
function PaymentResultPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const success = params.get('success') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const result = await getOrderById(orderId);
        if (cancelled) return;
        setOrder(result);

        // Webhook'un kupon üretmesi için kısa polling
        if (
          result &&
          result.status !== 'coupon_issued' &&
          result.status !== 'cancelled' &&
          attempts < 5
        ) {
          attempts += 1;
          setTimeout(poll, 1500);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <PageWrapper>
      <div className="mx-auto max-w-lg">
        <Card>
          <CardBody className="py-12 text-center">
            {loading ? (
              <>
                <Spinner size="lg" className="mx-auto" />
                <p className="mt-4 text-sm text-on-surface-variant">
                  Ödeme sonucu kontrol ediliyor…
                </p>
              </>
            ) : success && order?.status === 'coupon_issued' ? (
              <SuccessView orderId={orderId} />
            ) : success && order?.status === 'paid' ? (
              <PendingView orderId={orderId} />
            ) : (
              <FailView />
            )}
          </CardBody>
        </Card>
      </div>
    </PageWrapper>
  );
}

function SuccessView({ orderId }) {
  return (
    <>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <span className="material-symbols-outlined text-3xl">check</span>
      </div>
      <h1 className="text-xl font-headline font-bold text-on-surface">
        Ödemeniz Başarılı!
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Kuponunuz hazır. Detayları "Kuponlarım" sayfasından görebilirsiniz.
      </p>
      <p className="mt-1 font-mono text-xs text-on-surface-variant/70">
        Sipariş: {orderId}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Link to="/hesabim/kuponlarim">
          <Button>Kuponlarıma Git</Button>
        </Link>
        <Link to="/">
          <Button variant="ghost">Ana Sayfa</Button>
        </Link>
      </div>
    </>
  );
}

function PendingView({ orderId }) {
  return (
    <>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container">
        <span className="material-symbols-outlined text-3xl">hourglass_top</span>
      </div>
      <h1 className="text-xl font-headline font-bold text-on-surface">
        Ödemeniz Alındı
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Kuponunuz kısa süre içinde hazırlanacak. Bu işlem birkaç saniye sürebilir.
      </p>
      <p className="mt-1 font-mono text-xs text-on-surface-variant/70">
        Sipariş: {orderId}
      </p>
    </>
  );
}

function FailView() {
  return (
    <>
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-error">
        <span className="material-symbols-outlined text-3xl">close</span>
      </div>
      <h1 className="text-xl font-headline font-bold text-on-surface">
        Ödeme Başarısız
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        Ödemeniz tamamlanamadı. Lütfen tekrar deneyin.
      </p>
      <Link to="/" className="mt-6 inline-block">
        <Button variant="ghost">Ana Sayfaya Dön</Button>
      </Link>
    </>
  );
}

export default PaymentResultPage;
export { PaymentResultPage as Component };
