import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import Seo from '../../components/seo/Seo';
import { Button, Spinner } from '../../components/ui';
import { cn, formatPrice, discountPercent, timeLeft } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { useCampaignBySlug } from './useCampaignBySlug';
import { useCreateOrder } from '../orders/useCreateOrder';

/* ─────────────────────────── Sub-Components ─────────────────────────── */

function CampaignGallery({ images, title, selectedImage, onSelect }) {
  const hasImages = images?.length > 0;
  return (
    <div>
      <div className="aspect-[16/10] overflow-hidden rounded-xl bg-surface-container-low">
        {hasImages ? (
          <img
            src={images[selectedImage]}
            alt={title}
            className="h-full w-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-on-surface-variant/40">
            <span className="material-symbols-outlined text-5xl">image</span>
            <span className="text-sm">Görsel yok</span>
          </div>
        )}
      </div>
      {images?.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img + idx}
              type="button"
              onClick={() => onSelect(idx)}
              className={cn(
                'h-14 w-18 shrink-0 overflow-hidden rounded-lg transition-all duration-200',
                idx === selectedImage
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                  : 'opacity-50 hover:opacity-80',
              )}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignHeader({ campaign, discount }) {
  return (
    <div className="space-y-3">
      <h1 className="font-headline text-2xl font-semibold leading-tight text-on-surface md:text-[28px]">
        {campaign.title}
      </h1>
      {campaign.shortDescription && (
        <p className="text-[15px] leading-relaxed text-on-surface-variant">
          {campaign.shortDescription}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {campaign.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-fixed px-2.5 py-1 text-xs font-medium text-on-primary-fixed">
            <span className="material-symbols-outlined text-[14px]">star</span>
            Öne Çıkan
          </span>
        )}
        {discount > 0 && (
          <span className="inline-flex items-center rounded-full bg-error-container px-2.5 py-1 text-xs font-medium text-on-error-container">
            %{discount} indirim
          </span>
        )}
        {campaign.location?.district && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[13px]">location_on</span>
            {campaign.location.district}
          </span>
        )}
        {campaign.expiresAt && (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            {timeLeft(campaign.expiresAt)}
          </span>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, icon, children }) {
  if (!children) return null;
  return (
    <div className="py-6">
      <h2 className="mb-4 flex items-center gap-2 font-headline text-lg font-semibold text-on-surface">
        {icon && (
          <span className="material-symbols-outlined text-[20px] text-primary">{icon}</span>
        )}
        {title}
      </h2>
      {children}
    </div>
  );
}

function HighlightsSection({ highlights }) {
  if (!highlights?.length) return null;
  return (
    <DetailSection title="Öne Çıkanlar" icon="auto_awesome">
      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {highlights.map((h, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[14px] text-on-surface-variant">
            <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">
              check_circle
            </span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </DetailSection>
  );
}

function FAQSection({ faq }) {
  if (!faq?.length) return null;
  return (
    <DetailSection title="Sıkça Sorulan Sorular" icon="help_outline">
      <div className="space-y-2">
        {faq.map((q, i) => (
          <details
            key={i}
            className="group rounded-lg border border-outline-variant/60 bg-surface-container-lowest transition-colors open:bg-surface-container-low"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[14px] font-medium text-on-surface">
              {q.question}
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform group-open:rotate-180">
                expand_more
              </span>
            </summary>
            <p className="px-4 pb-4 text-[14px] leading-relaxed text-on-surface-variant">
              {q.answer}
            </p>
          </details>
        ))}
      </div>
    </DetailSection>
  );
}

function PackageSelector({ packages, selectedPkg, onSelect }) {
  if (packages.length <= 1) return null;
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        Paket Seçin
      </h3>
      <div className="space-y-2">
        {packages.map((p) => {
          const pStock = p.quota > 0 ? p.quota - (p.soldCount ?? 0) : null;
          const isSelected = selectedPkg?.id === p.id;
          const isOos = pStock === 0;
          return (
            <button
              key={p.id}
              type="button"
              disabled={isOos}
              onClick={() => onSelect(p.id)}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary-fixed/20 shadow-sm'
                  : 'border-outline-variant/60 hover:border-on-surface-variant/30',
                isOos && 'cursor-not-allowed opacity-40',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-on-surface">{p.name}</span>
                    {isOos && (
                      <span className="rounded bg-error-container px-1.5 py-0.5 text-[10px] font-medium text-on-error-container">
                        Tükendi
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="mt-0.5 truncate text-xs text-on-surface-variant">
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-on-surface">
                    {formatPrice(p.price)}
                  </div>
                  {p.originalPrice > p.price && (
                    <div className="text-[11px] text-on-surface-variant line-through">
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
  );
}

function QuantitySelector({ quantity, setQuantity, stockLeft }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-outline-variant/60 px-4 py-2.5">
      <span className="text-sm text-on-surface-variant">Adet</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/60 text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[16px]">remove</span>
        </button>
        <span className="w-6 text-center text-sm font-medium text-on-surface">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.min(stockLeft ?? 10, q + 1))}
          disabled={stockLeft !== null && quantity >= stockLeft}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-outline-variant/60 text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
        </button>
      </div>
    </div>
  );
}

function InstallmentSelector({ options, selected, onSelect, note }) {
  if (options.length <= 1) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        Taksit
      </h4>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.count}
            type="button"
            onClick={() => onSelect(opt.count)}
            className={cn(
              'rounded-lg border px-2 py-2 text-center transition-all duration-200',
              selected === opt.count
                ? 'border-primary bg-primary-fixed/20 text-on-surface'
                : 'border-outline-variant/60 text-on-surface-variant hover:border-on-surface-variant/30',
            )}
          >
            <div className="text-xs font-medium">{opt.label}</div>
            {opt.count > 1 && (
              <div className="mt-0.5 text-[10px] text-on-surface-variant">
                {formatPrice(opt.perMonth)}/ay
              </div>
            )}
          </button>
        ))}
      </div>
      {note && (
        <p className="text-[11px] text-on-surface-variant">{note}</p>
      )}
    </div>
  );
}

function InfoRow({ icon, children }) {
  return (
    <div className="flex items-center gap-2.5 text-[13px] text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function PurchaseCard({
  pkg,
  packages,
  discount,
  quantity,
  setQuantity,
  stockLeft,
  totalPrice,
  totalOriginal,
  installments,
  setInstallments,
  installmentOptions,
  installmentNote,
  campaign,
  onSelectPackage,
  onBuy,
  isBuying,
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-md">
      {/* Price display */}
      <div className="mb-5">
        {pkg && (
          <div className="flex items-baseline gap-2.5">
            <span className="font-headline text-[28px] font-bold text-on-surface">
              {formatPrice(pkg.price)}
            </span>
            {pkg.originalPrice > pkg.price && (
              <>
                <span className="text-sm text-on-surface-variant/70 line-through">
                  {formatPrice(pkg.originalPrice)}
                </span>
                {discount > 0 && (
                  <span className="rounded-md bg-error-container px-1.5 py-0.5 text-[11px] font-medium text-on-error-container">
                    −{discount}%
                  </span>
                )}
              </>
            )}
          </div>
        )}
        {packages.length <= 1 && (
          <p className="mt-0.5 text-xs text-on-surface-variant">kişi başı</p>
        )}
      </div>

      <div className="space-y-4">
        <PackageSelector packages={packages} selectedPkg={pkg} onSelect={onSelectPackage} />
        <QuantitySelector quantity={quantity} setQuantity={setQuantity} stockLeft={stockLeft} />

        {/* Stock & time info */}
        {(stockLeft !== null || campaign.expiresAt) && (
          <div className="space-y-1.5 rounded-xl bg-surface-container-low/60 px-4 py-3">
            {campaign.expiresAt && <InfoRow icon="schedule">{timeLeft(campaign.expiresAt)}</InfoRow>}
            {stockLeft !== null && (
              <InfoRow icon="inventory_2">
                {stockLeft > 0 ? `Son ${stockLeft} adet` : 'Stokta kalmadı'}
              </InfoRow>
            )}
          </div>
        )}

        <InstallmentSelector
          options={installmentOptions}
          selected={installments}
          onSelect={setInstallments}
          note={installmentNote}
        />

        {/* Total */}
        <div className="flex items-end justify-between border-t border-outline-variant/30 pt-4">
          <span className="text-sm text-on-surface-variant">Toplam</span>
          <div className="text-right">
            {totalOriginal > totalPrice && (
              <div className="text-xs text-on-surface-variant/60 line-through">
                {formatPrice(totalOriginal)}
              </div>
            )}
            <div className="font-headline text-xl font-bold text-on-surface">
              {formatPrice(totalPrice)}
            </div>
            {installments > 1 && (
              <p className="text-[11px] text-on-surface-variant">
                {installments} × {formatPrice(totalPrice / installments)}
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <Button
          size="lg"
          className="w-full rounded-xl py-3.5 text-base"
          onClick={onBuy}
          loading={isBuying}
          disabled={stockLeft === 0}
        >
          {stockLeft === 0 ? 'Stokta yok' : 'Hemen Satın Al'}
        </Button>

        {/* Trust line */}
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Güvenli ödeme · SSL · iyzico
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */

function CampaignDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: campaign, isLoading, error } = useCampaignBySlug(slug);
  const createOrder = useCreateOrder();

  const [selectedImage, setSelectedImage] = useState(0);
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
        <div className="py-16 text-center">
          <span className="material-symbols-outlined mb-3 text-5xl text-on-surface-variant/30">
            search_off
          </span>
          <p className="text-sm text-on-surface-variant">Kampanya bulunamadı.</p>
          <Link
            to="/"
            className="mt-4 inline-block text-sm font-medium text-primary hover:underline"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </PageWrapper>
    );
  }

  const discount = discountPercent(pkg?.originalPrice, pkg?.price);
  const stockLeft = pkg?.quota > 0 ? pkg.quota - (pkg.soldCount ?? 0) : null;
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
    <PageWrapper className="pb-16">
      <Seo
        title={`${campaign.title} — GRP Kampanya`}
        description={campaign.shortDescription ?? campaign.description?.slice(0, 160)}
      />

      {/* Breadcrumb */}
      <nav className="mb-6 text-[13px] text-on-surface-variant/60">
        <Link to="/" className="transition-colors hover:text-primary">
          Ana Sayfa
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-on-surface-variant">{campaign.title}</span>
      </nav>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        {/* ── Left Column ── */}
        <div>
          <CampaignGallery
            images={campaign.images}
            title={campaign.title}
            selectedImage={selectedImage}
            onSelect={setSelectedImage}
          />

          <div className="mt-6">
            <CampaignHeader campaign={campaign} discount={discount} />
          </div>

          {/* ── Content sections with dividers ── */}
          <div className="divide-y divide-outline-variant/30">
            <HighlightsSection highlights={campaign.highlights} />

            {campaign.description && (
              <DetailSection title="Açıklama" icon="description">
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-on-surface-variant">
                  {campaign.description}
                </p>
              </DetailSection>
            )}

            {(campaign.included?.length > 0 || campaign.notIncluded?.length > 0) && (
              <DetailSection title="Neler Dahil?" icon="checklist">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {campaign.included?.length > 0 && (
                    <div>
                      <h4 className="mb-2.5 text-sm font-medium text-on-surface">
                        Dahil Olanlar
                      </h4>
                      <ul className="space-y-2">
                        {campaign.included.map((x, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[14px] text-on-surface-variant"
                          >
                            <span className="material-symbols-outlined mt-0.5 text-[16px] text-primary">
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
                      <h4 className="mb-2.5 text-sm font-medium text-on-surface">
                        Dahil Olmayanlar
                      </h4>
                      <ul className="space-y-2">
                        {campaign.notIncluded.map((x, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[14px] text-on-surface-variant"
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
              </DetailSection>
            )}

            {campaign.howToUse?.length > 0 && (
              <DetailSection title="Nasıl Kullanılır?" icon="tips_and_updates">
                <ol className="space-y-3">
                  {campaign.howToUse.map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[14px] text-on-surface-variant"
                    >
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-[11px] font-semibold text-on-primary-fixed">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </DetailSection>
            )}

            {(campaign.terms || campaign.cancellation) && (
              <DetailSection title="Koşullar" icon="gavel">
                <div className="space-y-4">
                  {campaign.terms && (
                    <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-on-surface-variant">
                      {campaign.terms}
                    </p>
                  )}
                  {campaign.cancellation && (
                    <div className="rounded-xl bg-surface-container-low/60 p-4">
                      <h4 className="mb-1 flex items-center gap-1.5 text-sm font-medium text-on-surface">
                        <span className="material-symbols-outlined text-[16px]">keyboard_return</span>
                        İptal &amp; İade
                      </h4>
                      <p className="text-[13px] text-on-surface-variant">
                        {campaign.cancellation}
                      </p>
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            {(campaign.location?.address || campaign.location?.phone || campaign.location?.workingHours) && (
              <DetailSection title="Konum ve İletişim" icon="location_on">
                <div className="space-y-2.5 text-[14px]">
                  {campaign.location?.address && (
                    <InfoRow icon="location_on">{campaign.location.address}</InfoRow>
                  )}
                  {campaign.location?.phone && (
                    <div className="flex items-center gap-2.5 text-[13px]">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">call</span>
                      <a
                        href={`tel:${campaign.location.phone}`}
                        className="text-on-surface-variant transition-colors hover:text-primary"
                      >
                        {campaign.location.phone}
                      </a>
                    </div>
                  )}
                  {campaign.location?.workingHours && (
                    <InfoRow icon="schedule">{campaign.location.workingHours}</InfoRow>
                  )}
                  {campaign.location?.mapUrl && (
                    <a
                      href={campaign.location.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-outline-variant/60 px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined text-[16px]">map</span>
                      Haritada Göster
                    </a>
                  )}
                </div>
              </DetailSection>
            )}

            <FAQSection faq={campaign.faq} />
          </div>
        </div>

        {/* ── Right Column — Sticky Purchase Card ── */}
        <div className="lg:sticky lg:top-24">
          <PurchaseCard
            pkg={pkg}
            packages={packages}
            discount={discount}
            quantity={quantity}
            setQuantity={setQuantity}
            stockLeft={stockLeft}
            totalPrice={totalPrice}
            totalOriginal={totalOriginal}
            installments={installments}
            setInstallments={setInstallments}
            installmentOptions={installmentOptions}
            installmentNote={installmentNote}
            campaign={campaign}
            onSelectPackage={setSelectedPackageId}
            onBuy={handleBuy}
            isBuying={createOrder.isPending}
          />
        </div>
      </div>
    </PageWrapper>
  );
}

export default CampaignDetailPage;
export { CampaignDetailPage as Component };
