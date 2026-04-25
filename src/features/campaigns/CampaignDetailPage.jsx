import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import Seo from '../../components/seo/Seo';
import { Button, Card, CardBody, Spinner, Badge } from '../../components/ui';
import { cn } from '../../lib/utils';
import { formatPrice, discountPercent, timeLeft } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { useCampaignBySlug } from './useCampaignBySlug';
import { useCreateOrder } from '../orders/useCreateOrder';

/**
 * DEMO SAYFASI — tasarımı gerçek frontend developer tarafından rafine edilecek.
 * Amaç: backend akışın uçtan uca çalıştığını göstermek + zengin kampanya
 * verisinin nasıl render edildiğini ortaya koymak.
 */

const TABS = [
  { id: 'description', label: 'Açıklama', icon: 'description' },
  { id: 'included', label: 'Ne Dahil?', icon: 'checklist' },
  { id: 'howto', label: 'Nasıl Kullanılır?', icon: 'tips_and_updates' },
  { id: 'terms', label: 'Koşullar', icon: 'gavel' },
  { id: 'location', label: 'Konum', icon: 'location_on' },
  { id: 'faq', label: 'SSS', icon: 'help_outline' },
];

function CampaignDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: campaign, isLoading, error } = useCampaignBySlug(slug);
  const createOrder = useCreateOrder();

  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [installments, setInstallments] = useState(1);

  // Legacy veri desteği: packages yoksa top-level price'tan tek paket türet.
  const packages = useMemo(() => {
    if (!campaign) return [];
    if (campaign.packages?.length) return campaign.packages;
    return [
      {
        id: 'legacy',
        name: 'Standart',
        description: '',
        price: campaign.price ?? 0,
        originalPrice: campaign.originalPrice ?? 0,
        quota: campaign.quota ?? 0,
        soldCount: campaign.soldCount ?? 0,
        isDefault: true,
      },
    ];
  }, [campaign]);

  const selectedPackage = useMemo(() => {
    if (!packages.length) return null;
    return (
      packages.find((p) => p.id === selectedPackageId) ??
      packages.find((p) => p.isDefault) ??
      packages[0]
    );
  }, [packages, selectedPackageId]);

  // Fiyat ve taksit hesapları — tüm hook'lar early return'lerden önce kalmalı.
  const pkg = selectedPackage;
  const totalPrice = (pkg?.price ?? 0) * quantity;
  const maxInstallments = campaign?.paymentInfo?.maxInstallments ?? 1;

  const installmentOptions = useMemo(() => {
    const opts = [1, 2, 3, 6, 9, 12].filter((n) => n <= maxInstallments);
    return opts.map((n) => ({
      count: n,
      perMonth: totalPrice / n,
      label: n === 1 ? 'Tek Çekim' : `${n} Taksit`,
    }));
  }, [maxInstallments, totalPrice]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !campaign) {
    return (
      <PageWrapper>
        <Card>
          <CardBody className="py-12 text-center">
            <p className="text-sm text-on-surface-variant">
              Kampanya bulunamadı.
            </p>
            <Link
              to="/"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Ana sayfaya dön
            </Link>
          </CardBody>
        </Card>
      </PageWrapper>
    );
  }

  const discount = discountPercent(pkg?.originalPrice, pkg?.price);
  const stockLeft =
    pkg?.quota > 0 ? pkg.quota - (pkg.soldCount ?? 0) : null;
  const installmentNote = campaign.paymentInfo?.installmentNote ?? '';
  const totalOriginal = (pkg?.originalPrice ?? 0) * quantity;

  const handleBuy = async () => {
    if (!user) {
      toast.error('Satın almak için giriş yapmalısınız.');
      navigate('/giris', { state: { from: `/kampanya/${slug}` } });
      return;
    }
    try {
      const { paymentPageUrl } = await createOrder.mutateAsync({
        campaignId: campaign.id,
        packageId: pkg?.id,
        quantity,
        installments,
      });
      if (paymentPageUrl?.startsWith('http')) {
        window.location.href = paymentPageUrl;
      } else {
        navigate(paymentPageUrl);
      }
    } catch (err) {
      toast.error(err.message ?? 'Sipariş oluşturulamadı.');
    }
  };

  return (
    <PageWrapper>
      <Seo
        title={`${campaign.title} — GRP Kampanya`}
        description={campaign.shortDescription ?? campaign.description?.slice(0, 160)}
      />

      <nav className="mb-4 text-xs text-on-surface-variant">
        <Link to="/" className="hover:text-primary">
          Ana Sayfa
        </Link>
        <span className="mx-1">/</span>
        <span className="text-on-surface">{campaign.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* SOL KOLON */}
        <div className="space-y-6">
          {/* Galeri */}
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-surface-container shadow-sm">
              {campaign.images?.[selectedImage] ? (
                <img
                  src={campaign.images[selectedImage]}
                  alt={campaign.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-on-surface-variant/50">
                  <span className="material-symbols-outlined text-6xl">
                    image
                  </span>
                </div>
              )}
            </div>

            {campaign.images?.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {campaign.images.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      'h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2',
                      idx === selectedImage
                        ? 'border-primary'
                        : 'border-transparent opacity-60 hover:opacity-100',
                    )}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Başlık + kısa açıklama */}
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              {campaign.isFeatured && (
                <Badge variant="warning">⭐ Öne Çıkan</Badge>
              )}
              {discount > 0 && (
                <Badge variant="danger">%{discount} indirim</Badge>
              )}
              {campaign.location?.district && (
                <Badge variant="neutral">
                  <span className="material-symbols-outlined text-[14px]">
                    location_on
                  </span>
                  {campaign.location.district}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-headline font-bold leading-tight text-on-surface md:text-3xl">
              {campaign.title}
            </h1>
            {campaign.shortDescription && (
              <p className="mt-2 text-base text-on-surface-variant">
                {campaign.shortDescription}
              </p>
            )}
          </div>

          {/* Öne çıkanlar şeridi */}
          {campaign.highlights?.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="mb-3 text-sm font-semibold text-on-surface">
                  Öne Çıkanlar
                </h3>
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {campaign.highlights.map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-on-surface-variant"
                    >
                      <span className="material-symbols-outlined mt-0.5 text-[18px] text-primary">
                        check_circle
                      </span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {/* Sekmeler */}
          <Card>
            <CardBody className="space-y-4">
              <div className="flex flex-wrap gap-1 border-b border-outline-variant pb-2">
                {TABS.map((t) => {
                  // İçeriği yoksa sekmeyi gizle
                  const hasContent = (() => {
                    switch (t.id) {
                      case 'description':
                        return !!campaign.description;
                      case 'included':
                        return (
                          campaign.included?.length > 0 ||
                          campaign.notIncluded?.length > 0
                        );
                      case 'howto':
                        return campaign.howToUse?.length > 0;
                      case 'terms':
                        return !!campaign.terms || !!campaign.cancellation;
                      case 'location':
                        return !!(
                          campaign.location?.address ||
                          campaign.location?.phone ||
                          campaign.location?.workingHours
                        );
                      case 'faq':
                        return campaign.faq?.length > 0;
                      default:
                        return true;
                    }
                  })();
                  if (!hasContent) return null;
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors',
                        active
                          ? 'bg-primary-container text-on-primary-container'
                          : 'text-on-surface-variant hover:bg-surface-container',
                      )}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {t.icon}
                      </span>
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-[120px] pt-2">
                {activeTab === 'description' && (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                    {campaign.description}
                  </p>
                )}

                {activeTab === 'included' && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {campaign.included?.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-on-surface">
                          Dahil Olanlar
                        </h4>
                        <ul className="space-y-1.5">
                          {campaign.included.map((x, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-on-surface-variant"
                            >
                              <span className="material-symbols-outlined mt-0.5 text-[16px] text-tertiary">
                                check
                              </span>
                              <span>{x}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {campaign.notIncluded?.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-on-surface">
                          Dahil Olmayanlar
                        </h4>
                        <ul className="space-y-1.5">
                          {campaign.notIncluded.map((x, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-on-surface-variant"
                            >
                              <span className="material-symbols-outlined mt-0.5 text-[16px] text-error">
                                close
                              </span>
                              <span>{x}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'howto' && (
                  <ol className="space-y-3">
                    {campaign.howToUse.map((step, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-on-surface-variant"
                      >
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                          {i + 1}
                        </span>
                        <span className="pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                )}

                {activeTab === 'terms' && (
                  <div className="space-y-4">
                    {campaign.terms && (
                      <div>
                        <h4 className="mb-2 text-sm font-semibold text-on-surface">
                          Koşullar & Kurallar
                        </h4>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                          {campaign.terms}
                        </p>
                      </div>
                    )}
                    {campaign.cancellation && (
                      <div className="rounded-xl bg-surface-container-low p-3">
                        <h4 className="mb-1 text-sm font-semibold text-on-surface">
                          <span className="material-symbols-outlined mr-1 align-middle text-[18px]">
                            keyboard_return
                          </span>
                          İptal & İade
                        </h4>
                        <p className="text-sm text-on-surface-variant">
                          {campaign.cancellation}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'location' && (
                  <div className="space-y-3 text-sm">
                    {campaign.location?.address && (
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          location_on
                        </span>
                        <span className="text-on-surface-variant">
                          {campaign.location.address}
                        </span>
                      </div>
                    )}
                    {campaign.location?.phone && (
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          call
                        </span>
                        <a
                          href={`tel:${campaign.location.phone}`}
                          className="text-on-surface-variant hover:text-primary"
                        >
                          {campaign.location.phone}
                        </a>
                      </div>
                    )}
                    {campaign.location?.workingHours && (
                      <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          schedule
                        </span>
                        <span className="text-on-surface-variant">
                          {campaign.location.workingHours}
                        </span>
                      </div>
                    )}
                    {campaign.location?.mapUrl && (
                      <a
                        href={campaign.location.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-container/50 px-3 py-2 text-sm font-medium text-on-primary-container hover:bg-primary-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          map
                        </span>
                        Haritada Göster
                      </a>
                    )}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-2">
                    {campaign.faq.map((q, i) => (
                      <details
                        key={i}
                        className="group rounded-xl border border-outline-variant bg-surface-container-lowest p-3 open:bg-surface-container-low"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-on-surface">
                          {q.question}
                          <span className="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform group-open:rotate-180">
                            expand_more
                          </span>
                        </summary>
                        <p className="mt-2 text-sm text-on-surface-variant">
                          {q.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* SAĞ KOLON — Satın alma kutusu */}
        <div>
          <div className="sticky top-24 space-y-3">
            <Card>
              <CardBody className="space-y-4">
                {/* Paket seçici */}
                {packages.length > 1 && (
                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-on-surface">
                      Paket Seçin
                    </h3>
                    <div className="space-y-2">
                      {packages.map((p) => {
                        const pStock =
                          p.quota > 0 ? p.quota - (p.soldCount ?? 0) : null;
                        const isSelected = pkg?.id === p.id;
                        const isOos = pStock === 0;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            disabled={isOos}
                            onClick={() => setSelectedPackageId(p.id)}
                            className={cn(
                              'w-full rounded-xl border-2 p-3 text-left transition-all',
                              isSelected
                                ? 'border-primary bg-primary-container/20'
                                : 'border-outline-variant bg-surface-container-lowest hover:border-primary/50',
                              isOos && 'cursor-not-allowed opacity-50',
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-on-surface">
                                    {p.name}
                                  </span>
                                  {isOos && (
                                    <Badge variant="danger">Tükendi</Badge>
                                  )}
                                </div>
                                {p.description && (
                                  <p className="mt-0.5 text-xs text-on-surface-variant">
                                    {p.description}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="text-base font-bold text-tertiary">
                                  {formatPrice(p.price)}
                                </div>
                                {p.originalPrice > p.price && (
                                  <div className="text-xs text-on-surface-variant line-through">
                                    {formatPrice(p.originalPrice)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tek paket varsa büyük fiyat */}
                {packages.length === 1 && pkg && (
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-headline font-bold text-tertiary">
                      {formatPrice(pkg.price)}
                    </span>
                    {pkg.originalPrice > pkg.price && (
                      <>
                        <span className="text-base text-on-surface-variant line-through">
                          {formatPrice(pkg.originalPrice)}
                        </span>
                        <Badge variant="danger">%{discount} indirim</Badge>
                      </>
                    )}
                  </div>
                )}

                {/* Adet seçici */}
                <div className="flex items-center justify-between rounded-xl border border-outline-variant p-2">
                  <span className="text-sm font-medium text-on-surface">
                    Adet
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        remove
                      </span>
                    </button>
                    <span className="w-8 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) =>
                          Math.min(stockLeft ?? 10, q + 1),
                        )
                      }
                      disabled={stockLeft !== null && quantity >= stockLeft}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-low hover:bg-surface-container disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        add
                      </span>
                    </button>
                  </div>
                </div>

                {/* Ara bilgiler */}
                <div className="space-y-2 rounded-xl bg-surface-container-low p-3 text-sm">
                  {campaign.expiresAt && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">
                        schedule
                      </span>
                      <span>{timeLeft(campaign.expiresAt)}</span>
                    </div>
                  )}
                  {stockLeft !== null && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[18px]">
                        inventory_2
                      </span>
                      <span>
                        {stockLeft > 0
                          ? `Son ${stockLeft} adet`
                          : 'Stokta kalmadı'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Toplam + taksit */}
                <div className="rounded-xl border border-outline-variant p-3">
                  <div className="flex items-end justify-between">
                    <span className="text-xs text-on-surface-variant">
                      Toplam
                    </span>
                    <div className="text-right">
                      {totalOriginal > totalPrice && (
                        <div className="text-xs text-on-surface-variant line-through">
                          {formatPrice(totalOriginal)}
                        </div>
                      )}
                      <div className="text-2xl font-bold text-tertiary">
                        {formatPrice(totalPrice)}
                      </div>
                    </div>
                  </div>

                  {installments > 1 && (
                    <p className="mt-1 text-right text-xs text-on-surface-variant">
                      {installments} × {formatPrice(totalPrice / installments)}
                    </p>
                  )}
                </div>

                {/* Taksit seçenekleri */}
                {maxInstallments > 1 && (
                  <div>
                    <h4 className="mb-2 text-xs font-semibold text-on-surface">
                      Taksit Seçenekleri
                    </h4>
                    <div className="grid grid-cols-3 gap-1.5">
                      {installmentOptions.map((opt) => (
                        <button
                          key={opt.count}
                          type="button"
                          onClick={() => setInstallments(opt.count)}
                          className={cn(
                            'rounded-lg border p-2 text-center text-xs transition-colors',
                            installments === opt.count
                              ? 'border-primary bg-primary-container/30 text-on-primary-container'
                              : 'border-outline-variant hover:border-primary/50',
                          )}
                        >
                          <div className="font-semibold">{opt.label}</div>
                          {opt.count > 1 && (
                            <div className="text-[10px] text-on-surface-variant">
                              {formatPrice(opt.perMonth)}/ay
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {installmentNote && (
                      <p className="mt-2 text-[11px] italic text-on-surface-variant">
                        {installmentNote}
                      </p>
                    )}
                  </div>
                )}

                {/* CTA */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleBuy}
                  loading={createOrder.isPending}
                  disabled={stockLeft === 0}
                >
                  {stockLeft === 0 ? 'Stokta yok' : 'Hemen Satın Al'}
                </Button>

                {/* Güven rozetleri */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-surface-container-low p-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      lock
                    </span>
                    <p className="text-[10px] text-on-surface-variant">
                      256-bit SSL
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      verified_user
                    </span>
                    <p className="text-[10px] text-on-surface-variant">
                      iyzico Güvencesi
                    </p>
                  </div>
                  <div className="rounded-lg bg-surface-container-low p-2">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      support_agent
                    </span>
                    <p className="text-[10px] text-on-surface-variant">
                      7/24 Destek
                    </p>
                  </div>
                </div>

                <p className="text-center text-[11px] text-on-surface-variant">
                  Güvenli ödeme · iyzico altyapısı
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

export default CampaignDetailPage;
export { CampaignDetailPage as Component };
