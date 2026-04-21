import { Link } from 'react-router-dom';
import { cn, formatPrice, discountPercent, timeLeft } from '../../../lib/utils';

/**
 * Kampanya kartı.
 *
 * variant:
 *   - "grid"    (varsayılan) : listeleme için 4:3 görsel + alt bilgi
 *   - "featured"             : ana sayfada büyük banner (16:9 / metin-görsel yan yana)
 *   - "compact"              : küçük kart (bento gridin stacked versiyonu)
 */
export default function CampaignCard({
  campaign,
  variant = 'grid',
  className,
}) {
  const {
    slug,
    title,
    description,
    price,
    originalPrice,
    images,
    expiresAt,
  } = campaign;

  const href = `/kampanya/${slug}`;
  const image = images?.[0];
  const discount = discountPercent(originalPrice, price);
  const leftLabel = expiresAt ? timeLeft(expiresAt) : null;

  if (variant === 'featured') {
    return (
      <Link
        to={href}
        className={cn(
          'group flex flex-col md:flex-row overflow-hidden rounded-2xl bg-surface-container-low',
          'transition-shadow duration-300 hover:shadow-[0_20px_50px_rgba(28,28,25,0.08)]',
          className,
        )}
      >
        <div className="md:w-1/2 aspect-[16/10] md:aspect-auto overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-between p-8 md:w-1/2 md:p-10">
          <div>
            {leftLabel && (
              <span className="mb-4 inline-block rounded-sm bg-primary-fixed/60 px-3 py-1 text-[10px] font-label font-bold uppercase tracking-widest text-primary">
                {leftLabel}
              </span>
            )}
            <h3 className="mb-3 font-headline text-3xl text-on-surface md:text-4xl">
              {title}
            </h3>
            <p className="mb-6 max-w-md font-body text-sm leading-relaxed text-on-surface-variant md:text-base md:leading-loose">
              {description}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {originalPrice > price && (
                <span className="text-sm font-label text-on-surface-variant line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="font-headline text-3xl text-primary">
                {formatPrice(price)}
              </span>
            </div>
            <span className="flex items-center gap-2 font-label font-semibold text-primary transition-all duration-300 group-hover:gap-4">
              Detaylar
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // ─── grid (default) ────────────────────────────────────────────────
  return (
    <Link
      to={href}
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_12px_32px_rgba(28,28,25,0.05)]',
        'transition-all duration-300 hover:shadow-[0_20px_40px_rgba(28,28,25,0.10)]',
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
        {discount > 0 && (
          <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-label font-bold text-on-primary shadow-sm">
            %{discount} indirim
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-2 font-headline text-xl text-on-surface line-clamp-2">
          {title}
        </h3>
        <p className="mb-6 font-body text-sm leading-relaxed text-on-surface-variant line-clamp-2">
          {description}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/20 pt-5">
          <div className="flex flex-col">
            {originalPrice > price && (
              <span className="text-xs font-label text-on-surface-variant line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="font-headline text-xl text-primary">
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

/**
 * CampaignCard.Skeleton — veri yüklenirken gösterilecek placeholder
 */
CampaignCard.Skeleton = function CampaignCardSkeleton({ className }) {
  return (
    <div
      className={cn(
        'flex animate-pulse flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm',
        className,
      )}
    >
      <div className="aspect-[4/3] bg-surface-container" />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 h-5 w-3/4 rounded bg-surface-container" />
        <div className="mb-2 h-3 w-full rounded bg-surface-container" />
        <div className="mb-6 h-3 w-5/6 rounded bg-surface-container" />
        <div className="mt-auto flex items-center justify-between border-t border-outline-variant/20 pt-5">
          <div className="h-6 w-20 rounded bg-surface-container" />
          <div className="h-10 w-10 rounded-full bg-surface-container" />
        </div>
      </div>
    </div>
  );
};
