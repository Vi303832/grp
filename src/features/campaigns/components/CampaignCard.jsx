import { Link } from 'react-router-dom';
import { cn, formatPrice, discountPercent, timeLeft } from '../../../lib/utils';

/**
 * Kampanya kartı.
 *
 * variant:
 *   - "grid"    (varsayılan) : listeleme için 4:3 görsel + alt bilgi (konum, işletme, puan)
 *   - "featured"             : ana sayfada büyük banner (16:9 / metin-görsel yan yana)
 *   - "compact"              : küçük aside kartı (yan yan featured alanı için)
 *   - "square"               : haftanın seçkileri için kare, birleşik grid kartı
 */
export default function CampaignCard({
  campaign,
  variant = 'grid',
  className,
  hero = false,
  rowMode = false,
}) {
  const {
    slug,
    title,
    description,
    price,
    originalPrice,
    images,
    expiresAt,
    district,
    businessName,
    rating,
  } = campaign;

  const href = `/kampanya/${slug}`;
  const image = images?.[0];
  const discount = discountPercent(originalPrice, price);
  const leftLabel = expiresAt ? timeLeft(expiresAt) : null;

  // ── FEATURED (büyük öne çıkan) ─────────────────────────────────────
  if (variant === 'featured') {
    return (
      <Link
        to={href}
        className={cn(
          'group relative flex flex-col overflow-hidden bg-surface-container-low',
          'transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(28,28,25,0.08)]',
          className,
        )}
      >
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {discount > 0 && <DiscountBadge percent={discount} />}
          {rating && <RatingBadge value={rating} />}
        </div>
        <div className="flex flex-col p-5 sm:p-6 md:p-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-xs font-label font-bold uppercase tracking-widest text-primary">
              Öne Çıkan
            </span>
            <span className="h-px w-10 bg-outline-variant" />
            {district && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {district}
              </span>
            )}
          </div>
          <h3 className="mb-2 font-headline text-xl leading-tight text-on-surface sm:text-2xl md:mb-3 md:text-3xl">
            {title}
          </h3>
          <p className="mb-4 line-clamp-3 max-w-2xl font-body text-sm leading-relaxed text-on-surface-variant md:mb-6 md:text-base md:leading-loose">
            {description}
          </p>
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col">
              {originalPrice > price && (
                <span className="text-xs font-label text-on-surface-variant line-through sm:text-sm">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="font-headline text-2xl font-extrabold text-on-tertiary-container sm:text-3xl">
                {formatPrice(price)}
              </span>
            </div>
            <span className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-label font-semibold text-on-primary transition hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm">
              <span className="hidden sm:inline">Detayları Gör</span>
              <span className="sm:hidden">Detay</span>
              <span className="material-symbols-outlined text-base sm:text-lg">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── COMPACT (yan küçük kart, featured yanında) ─────────────────────
  if (variant === 'compact') {
    return (
      <Link
        to={href}
        className={cn(
          'group flex flex-col overflow-hidden bg-surface-container-lowest',
          'shadow-[0_8px_24px_rgba(28,28,25,0.04)] transition-[transform,box-shadow] duration-300',
          'hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(28,28,25,0.10)]',
          className,
        )}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {discount > 0 && <DiscountBadge percent={discount} small />}
        </div>
        <div className="p-5">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">
            {district || 'Kampanya'}
          </span>
          <h3 className="mb-1 mt-1 line-clamp-2 font-headline text-lg leading-snug text-on-surface">
            {title}
          </h3>
          {businessName && (
            <p className="mb-3 text-xs text-on-surface-variant">{businessName}</p>
          )}
          <div className="flex items-end justify-between">
            <div>
              {originalPrice > price && (
                <span className="text-xs text-on-surface-variant line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="block font-headline text-xl font-extrabold text-on-tertiary-container">
                {formatPrice(price)}
              </span>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container transition-colors group-hover:bg-primary group-hover:text-on-primary">
              <span className="material-symbols-outlined">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── SQUARE (haftanın seçkileri – kare, birleşik, düz kenar) ────────
  if (variant === 'square') {
    return (
      <Link
        to={href}
        className={cn(
          'group relative flex aspect-square overflow-hidden bg-surface-container',
          'transition-[box-shadow] duration-300',
          'hover:z-10 hover:shadow-[0_18px_40px_rgba(28,28,25,0.22)]',
          className,
        )}
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {hero ? (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, rgba(177,90,23,0.85) 0%, rgba(28,28,25,0.55) 55%, rgba(28,28,25,0.1) 100%)',
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
        )}

        {discount > 0 && <DiscountBadge percent={discount} />}
        {rating && (
          <span className="absolute right-2 top-2 flex items-center gap-0.5 bg-white/90 px-2 py-0.5 text-[10px] font-label font-semibold text-primary backdrop-blur xs:right-3 xs:top-3 xs:gap-1 xs:px-2.5 xs:py-1 xs:text-xs">
            <span className="material-symbols-outlined text-xs xs:text-sm">star</span>
            {rating.toFixed(1)}
          </span>
        )}

        {hero && (
          <span className="absolute left-0 top-3 bg-white px-2 py-0.5 text-[9px] font-label font-bold uppercase tracking-widest text-primary shadow-sm xs:top-4 xs:px-3 xs:py-1 xs:text-[11px]">
            Haftanın Seçkisi
          </span>
        )}

        <div
          className={cn(
            'relative mt-auto flex w-full min-w-0 flex-col text-white',
            hero ? 'gap-2 p-4 sm:p-7 md:p-8' : 'gap-1 p-3 sm:gap-1.5 sm:p-5',
          )}
        >
          {district && (
            <span
              className={cn(
                'flex items-center gap-1 font-label uppercase tracking-widest opacity-90',
                hero ? 'text-xs sm:text-sm' : 'text-[11px]',
              )}
            >
              <span className="material-symbols-outlined text-sm">location_on</span>
              {district}
            </span>
          )}
          <h3
            className={cn(
              'line-clamp-2 font-headline font-semibold leading-snug',
              hero
                ? 'text-lg sm:text-2xl md:text-3xl'
                : 'text-sm sm:text-lg',
            )}
          >
            {title}
          </h3>
          {hero && description && (
            <p className="hidden max-w-lg font-body text-sm leading-relaxed opacity-90 sm:line-clamp-2 md:line-clamp-3">
              {description}
            </p>
          )}
          <div
            className={cn(
              'mt-1 flex items-end justify-between gap-3',
              hero && 'md:mt-3',
            )}
          >
            <div className="flex flex-col leading-tight">
              {originalPrice > price && (
                <span
                  className={cn(
                    'font-label line-through opacity-70',
                    hero ? 'text-xs sm:text-sm' : 'text-[11px]',
                  )}
                >
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span
                className={cn(
                  'font-headline font-extrabold',
                  hero
                    ? 'text-xl sm:text-3xl md:text-4xl'
                    : 'text-base sm:text-xl',
                )}
              >
                {formatPrice(price)}
              </span>
            </div>
            <span
              className={cn(
                'inline-flex shrink-0 items-center justify-center bg-white/15 text-white backdrop-blur transition group-hover:bg-white group-hover:text-on-surface',
                hero
                  ? 'gap-2 px-4 py-2 text-xs font-label font-semibold sm:px-5 sm:py-2.5 sm:text-sm'
                  : 'h-8 w-8 sm:h-9 sm:w-9',
              )}
            >
              {hero && (
                <>
                  <span className="hidden sm:inline">Detayları Gör</span>
                  <span className="sm:hidden">Detay</span>
                </>
              )}
              <span className="material-symbols-outlined text-sm sm:text-base">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ── GRID (varsayılan) ──────────────────────────────────────────────
  return (
    <Link
      to={href}
      className={cn(
        'group flex flex-col overflow-hidden border border-outline-variant/20 bg-surface-container-lowest',
        'transition-[transform,box-shadow] duration-300',
        'hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(28,28,25,0.10)]',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden',
          rowMode ? 'aspect-[16/10] xs:aspect-[4/3]' : 'aspect-[4/3]',
        )}
      >
        <img
          src={image}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {discount > 0 && <DiscountBadge percent={discount} />}
        {leftLabel && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-label font-semibold text-on-surface-variant backdrop-blur xs:bottom-3 xs:left-3 xs:px-2.5 xs:py-1 xs:text-[10px]">
            {leftLabel}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-3 xs:p-4 sm:p-5">
        {/* Konum + puan */}
        <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] text-on-surface-variant xs:text-xs">
          {district ? (
            <span className="flex min-w-0 items-center gap-0.5 truncate xs:gap-1">
              <span className="material-symbols-outlined text-xs xs:text-sm">location_on</span>
              <span className="truncate">{district}</span>
            </span>
          ) : <span />}
          {rating && (
            <span className="flex shrink-0 items-center gap-0.5 font-semibold text-primary xs:gap-1">
              <span className="material-symbols-outlined text-xs xs:text-sm">star</span>
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        <h3 className="mb-1 line-clamp-2 font-headline text-sm leading-snug text-on-surface xs:text-base sm:text-lg">
          {title}
        </h3>
        {businessName && (
          <p className="mb-2 line-clamp-1 text-[11px] text-on-surface-variant xs:mb-3 xs:text-xs sm:mb-4">
            {businessName}
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2 xs:pt-3 sm:pt-4">
          <div className="min-w-0">
            {originalPrice > price && (
              <span className="block truncate text-[10px] font-label text-on-surface-variant line-through xs:text-xs">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="block truncate font-headline text-base font-extrabold text-on-tertiary-container xs:text-lg sm:text-xl">
              {formatPrice(price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Alt parçalar ─────────────────────────────────────────────────────
function DiscountBadge({ percent, small = false }) {
  return (
    <span
      className={cn(
        'absolute left-2 top-2 rounded-full text-white font-label font-bold tracking-widest shadow-sm xs:left-3 xs:top-3',
        small
          ? 'px-2 py-0.5 text-[9px] xs:px-2.5 xs:py-1 xs:text-[10px]'
          : 'px-2 py-0.5 text-[10px] xs:px-3 xs:py-1.5 xs:text-xs',
      )}
      style={{ background: 'linear-gradient(135deg, #ff8031 0%, #b15a17 100%)' }}
    >
      -%{percent}
    </span>
  );
}

function RatingBadge({ value }) {
  return (
    <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-label font-semibold text-primary backdrop-blur xs:right-4 xs:top-4 xs:gap-1 xs:px-3 xs:py-1.5 xs:text-xs">
      <span className="material-symbols-outlined text-xs xs:text-sm">star</span>
      {value.toFixed(1)}
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────
CampaignCard.Skeleton = function CampaignCardSkeleton({ className }) {
  return (
    <div
      className={cn(
        'flex animate-pulse flex-col overflow-hidden border border-outline-variant/20 bg-surface-container-lowest',
        className,
      )}
    >
      <div className="aspect-[4/3] bg-surface-container" />
      <div className="flex flex-1 flex-col p-3 xs:p-4 sm:p-5">
        <div className="mb-2 h-2.5 w-1/3 bg-surface-container xs:mb-3 xs:h-3" />
        <div className="mb-2 h-4 w-3/4 bg-surface-container xs:h-5" />
        <div className="mb-3 h-2.5 w-1/2 bg-surface-container xs:mb-5 xs:h-3" />
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/20 pt-2 xs:pt-4">
          <div className="h-5 w-16 bg-surface-container xs:h-6 xs:w-20" />
          <div className="h-7 w-14 bg-surface-container xs:h-8 xs:w-20" />
        </div>
      </div>
    </div>
  );
};
