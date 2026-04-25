import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageWrapper from '../../components/layout/PageWrapper';
import Seo from '../../components/seo/Seo';
import { Button, Spinner } from '../../components/ui';
import { cn, formatPrice, formatDate, discountPercent, timeLeft } from '../../lib/utils';
import useAuthStore from '../../store/authStore';
import { useCampaignBySlug } from './useCampaignBySlug';
import { useCreateOrder } from '../orders/useCreateOrder';

/* ─────────────────────────── Sub-Components ─────────────────────────── */

function PhotoPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-container">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">image</span>
    </div>
  );
}

function CampaignGallery({ images, title }) {
  const imgs = images?.length ? images : [];
  const fill = (i) => imgs[i] || null;
  return (
    <>
      {/* Desktop: Airbnb 5-photo grid */}
      <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-2 h-[420px] rounded-xl overflow-hidden">
        <div className="col-span-2 row-span-2 relative">
          {fill(0) ? <img src={fill(0)} alt={title} className="h-full w-full object-cover" /> : <PhotoPlaceholder />}
        </div>
        {[1,2,3,4].map((i) => (
          <div key={i} className="relative overflow-hidden">
            {fill(i) ? <img src={fill(i)} alt="" className="h-full w-full object-cover hover:opacity-90 transition" /> : <PhotoPlaceholder />}
          </div>
        ))}
        {imgs.length > 5 && (
          <button type="button" className="absolute right-4 bottom-4 flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-on-surface shadow-md hover:bg-surface-container transition">
            <span className="material-symbols-outlined text-base">apps</span>
            Tüm fotoğrafları göster
          </button>
        )}
      </div>
      {/* Mobile: single image + thumbnails */}
      <div className="md:hidden">
        <div className="aspect-[16/10] overflow-hidden rounded-xl bg-surface-container-low">
          {fill(0) ? <img src={fill(0)} alt={title} className="h-full w-full object-cover" /> : <PhotoPlaceholder />}
        </div>
        {imgs.length > 1 && (
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {imgs.slice(0, 5).map((img, idx) => (
              <div key={idx} className="h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                <img src={img} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TitleBar({ campaign }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <h1 className="font-headline text-[22px] font-semibold leading-snug text-on-surface md:text-[26px]">
        {campaign.title}
      </h1>
      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <button type="button" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container transition">
          <span className="material-symbols-outlined text-lg">ios_share</span>
          Paylaş
        </button>
        <button type="button" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-on-surface hover:bg-surface-container transition">
          <span className="material-symbols-outlined text-lg">favorite_border</span>
          Kaydet
        </button>
      </div>
    </div>
  );
}

function MetaBadges({ campaign, discount }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-on-surface-variant">
      {campaign.district && (
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-base">location_on</span>
          {campaign.district}
        </span>
      )}
      {campaign.rating && (
        <span className="flex items-center gap-1 font-medium">
          <span className="material-symbols-outlined text-base text-primary">star</span>
          {campaign.rating.toFixed(1)}
        </span>
      )}
      {campaign.isFeatured && (
        <span className="rounded-full bg-primary-fixed/60 px-2 py-0.5 text-xs font-medium text-on-primary-fixed">Öne Çıkan</span>
      )}
      {discount > 0 && (
        <span className="rounded-full bg-error-container px-2 py-0.5 text-xs font-medium text-on-error-container">%{discount}</span>
      )}
      {campaign.expiresAt && (
        <span className="flex items-center gap-1 text-xs">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {timeLeft(campaign.expiresAt)}
        </span>
      )}
    </div>
  );
}

function HostSummary({ campaign }) {
  return (
    <div className="flex items-center gap-3 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-on-primary-container text-sm font-bold">
        {(campaign.businessName || 'G')[0].toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-on-surface">{campaign.businessName || 'GRP'} tarafından sunuluyor</p>
        {campaign.district && <p className="text-xs text-on-surface-variant">{campaign.district}</p>}
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

/* ─────────────── Reviews & Rating ─────────────── */

function RatingSummary({ rating, reviewCount }) {
  if (!rating) {
    return (
      <div className="flex items-center gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-xl">star_border</span>
        <span>Henüz puanlanmadı</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <span className="material-symbols-outlined text-2xl text-primary">star</span>
      <span className="font-headline text-xl font-semibold text-on-surface">{rating.toFixed(2)}</span>
      {reviewCount != null && (
        <span className="text-sm text-on-surface-variant">· {reviewCount} değerlendirme</span>
      )}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-sm font-bold text-on-surface-variant">
          {(review.userName || 'K')[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium text-on-surface">{review.userName || 'Kullanıcı'}</p>
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            {review.rating && (
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-sm text-primary">star</span>
                {review.rating.toFixed(1)}
              </span>
            )}
            {review.createdAt && (
              <span>· {formatDate(review.createdAt)}</span>
            )}
          </div>
        </div>
      </div>
      {review.comment && (
        <p className="text-[14px] leading-relaxed text-on-surface-variant">{review.comment}</p>
      )}
    </div>
  );
}

function ReviewsSection({ campaign }) {
  const reviews = campaign.reviews?.slice(0, 4) ?? [];
  const hasReviews = reviews.length > 0;
  return (
    <div className="py-6">
      <h2 className="mb-5 flex items-center gap-2 font-headline text-lg font-semibold text-on-surface">
        <span className="material-symbols-outlined text-[20px] text-primary">reviews</span>
        Değerlendirmeler
      </h2>
      <RatingSummary rating={campaign.rating} reviewCount={campaign.reviewCount} />
      {hasReviews ? (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>
          {(campaign.reviews?.length ?? 0) > 4 && (
            <button type="button" className="mt-6 rounded-lg border border-on-surface px-5 py-2.5 text-sm font-medium text-on-surface transition hover:bg-surface-container">
              Tüm {campaign.reviews.length} yorumu göster
            </button>
          )}
        </>
      ) : (
        <p className="mt-4 text-sm text-on-surface-variant">Bu kampanya için henüz yorum yok.</p>
      )}
    </div>
  );
}

/* ─────────────── Location & Map ─────────────── */

function LocationMap({ location }) {
  if (location?.mapEmbedUrl) {
    return (
      <div className="mt-4 overflow-hidden rounded-xl border border-outline-variant/30">
        <iframe
          src={location.mapEmbedUrl}
          title="Kampanya konumu"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          className="h-[260px] w-full border-0 md:h-[360px]"
        />
      </div>
    );
  }
  
  const hasCoordinates = location?.lat && location?.lng;
  if (location?.mapUrl || hasCoordinates) {
    return (
      <div className="mt-4 overflow-hidden rounded-xl border border-outline-variant/30">
        <div className="relative flex h-[260px] w-full items-center justify-center bg-[#f0f0f0] md:h-[360px]">
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20" 
            style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '20px 20px' }}
          ></div>
          
          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-4xl">location_on</span>
            </div>
            {location?.mapUrl && (
              <a
                href={location.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-on-surface shadow-sm transition hover:bg-surface-container"
              >
                Konumu haritada görüntüle
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
}

function LocationSection({ campaign }) {
  const loc = campaign.location;
  if (!loc) return null;
  const hasInfo = loc?.address || loc?.district;
  const hasMap = loc?.mapEmbedUrl || loc?.mapUrl || (loc?.lat && loc?.lng);
  
  if (!hasInfo && !hasMap) return null;
  
  return (
    <div className="py-8 border-b border-outline-variant/30">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-headline text-[22px] font-semibold text-on-surface">
          Nerede olacaksınız?
        </h2>
        {loc?.mapUrl && !loc?.mapEmbedUrl && (
           <a href={loc.mapUrl} target="_blank" rel="noreferrer" className="text-sm font-medium underline transition hover:text-primary">
             Haritada aç
           </a>
        )}
      </div>
      
      {hasInfo && (
        <p className="mb-6 text-[15px] text-on-surface-variant">
          {loc.address ? loc.address : loc.district}
        </p>
      )}
      
      <LocationMap location={loc} />
      
      <p className="mt-4 text-[13px] text-on-surface-variant/80">
        Tam konum satın alma sonrasında paylaşılacaktır.
      </p>
    </div>
  );
}

/* ─────────────── Availability Calendar ─────────────── */

function CalendarDay({ date, isAvailable, isSelected, onSelect, isPast }) {
  const isDisabled = isPast || !isAvailable;
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onSelect(date)}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors",
        isSelected && "bg-on-surface text-surface",
        !isSelected && isAvailable && !isPast && "hover:border hover:border-on-surface",
        !isSelected && isDisabled && "text-on-surface-variant/40 line-through",
        !isSelected && !isDisabled && "text-on-surface"
      )}
    >
      {date.getDate()}
    </button>
  );
}

function CalendarMonth({ year, month, availability, selectedDate, onSelect }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); 
  const startOffset = (firstDay + 6) % 7; // Monday is 0
  
  const today = new Date();
  today.setHours(0,0,0,0);

  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  const weekDays = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

  return (
    <div className="w-full">
      <h3 className="mb-4 text-center text-[15px] font-semibold text-on-surface">{monthNames[month]} {year}</h3>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {weekDays.map(d => (
          <div key={d} className="text-[11px] font-medium text-on-surface-variant/70">{d}</div>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const localDateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          
          let isAvailable = true;
          if (availability?.availableDates?.length) {
            isAvailable = availability.availableDates.includes(localDateStr);
          }
          if (availability?.unavailableDates?.includes(localDateStr)) {
            isAvailable = false;
          }
          
          const isPast = date < today;
          const isSelected = selectedDate === localDateStr;

          return (
            <div key={i} className="flex justify-center">
              <CalendarDay 
                date={date} 
                isAvailable={isAvailable} 
                isSelected={isSelected} 
                isPast={isPast} 
                onSelect={() => onSelect(localDateStr)} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AvailabilityCalendar({ availability, selectedDate, onSelect }) {
  if (!availability) {
    return (
      <div className="py-8 border-b border-outline-variant/30" id="calendar-section">
        <h2 className="mb-2 font-headline text-[22px] font-semibold text-on-surface">Müsaitlik durumu</h2>
        <p className="text-[15px] text-on-surface-variant">Bu hizmet için takvim bilgisi henüz eklenmemiş.</p>
      </div>
    );
  }

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);

  return (
    <div className="py-8 border-b border-outline-variant/30" id="calendar-section">
      <h2 className="mb-1 font-headline text-[22px] font-semibold text-on-surface">Müsaitlik durumu</h2>
      <p className="mb-8 text-[15px] text-on-surface-variant">Uygun tarihleri görüntüleyin</p>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <CalendarMonth year={currentYear} month={currentMonth} availability={availability} selectedDate={selectedDate} onSelect={onSelect} />
        <div className="hidden md:block">
          <CalendarMonth year={nextMonthDate.getFullYear()} month={nextMonthDate.getMonth()} availability={availability} selectedDate={selectedDate} onSelect={onSelect} />
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        {selectedDate ? (
          <p className="text-[14px] font-medium text-on-surface">
            Seçili tarih: {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        ) : <div />}
        {selectedDate && (
          <button type="button" onClick={() => onSelect(null)} className="text-[14px] font-medium underline text-on-surface transition hover:text-primary">
            Temizle
          </button>
        )}
      </div>
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
  selectedDate,
  onSelectPackage,
  onBuy,
  isBuying,
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/30 bg-white p-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
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
        
        {/* Date & Quantity - Airbnb style grid */}
        <div className="rounded-xl border border-outline-variant/60">
          <button 
            type="button" 
            onClick={() => document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex w-full flex-col items-start border-b border-outline-variant/60 px-4 py-2.5 transition hover:bg-surface-container-low"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface">Tarih</span>
            <span className={cn("text-sm font-medium", selectedDate ? "text-on-surface" : "text-on-surface-variant")}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Tarih seçin'}
            </span>
          </button>
          
          <div className="px-4 py-2.5">
            <QuantitySelector quantity={quantity} setQuantity={setQuantity} stockLeft={stockLeft} />
          </div>
        </div>

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

/* ─────────────── Amenities (Neler Dahil) ─────────────── */

const AmenitySvgIcons = {
  hairDryer: function HairDryerIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M14 27v.2a4 4 0 0 1-3.8 3.8H4v-2h6.15a2 2 0 0 0 1.84-1.84L12 27zM10 1c.54 0 1.07.05 1.58.14l.38.07 17.45 3.65a2 2 0 0 1 1.58 1.79l.01.16v6.38a2 2 0 0 1-1.43 1.91l-.16.04-13.55 2.83 1.76 6.5A2 2 0 0 1 15.87 27l-.18.01h-3.93a2 2 0 0 1-1.88-1.32l-.05-.15-1.88-6.76A9 9 0 0 1 10 1zm5.7 24-1.8-6.62-1.81.38a9 9 0 0 1-1.67.23h-.33L11.76 25zM10 3a7 7 0 1 0 1.32 13.88l.33-.07L29 13.18V6.8L11.54 3.17A7.03 7.03 0 0 0 10 3zm0 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
      </svg>
    );
  },
  wifi: function WifiIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M16 24.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm0 2a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zM16 17a9.98 9.98 0 0 1 7.07 2.93l-1.42 1.41A7.98 7.98 0 0 0 16 19a7.98 7.98 0 0 0-5.65 2.34l-1.42-1.41A9.98 9.98 0 0 1 16 17zm0-8c4.41 0 8.41 1.79 11.31 4.69l-1.41 1.41A13.96 13.96 0 0 0 16 11a13.96 13.96 0 0 0-9.9 4.1l-1.41-1.41A15.96 15.96 0 0 1 16 9zm0-8c6.63 0 12.63 2.68 16.97 7.03l-1.42 1.41A21.93 21.93 0 0 0 16 3 21.93 21.93 0 0 0 .45 12.44L-.97 11.03A23.93 23.93 0 0 1 16 1z" />
      </svg>
    );
  },
  parking: function ParkingIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M23.11 9.38A9.01 9.01 0 0 0 16 5H8v22h2V19h6a9 9 0 0 0 7.11-14.62zM16 17H10V7h6a7 7 0 0 1 0 14z" />
      </svg>
    );
  },
  pool: function PoolIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M30 20v2H2v-2h28zm-4 4v2H6v-2h20zm3.89-11.85l-1.42-1.41A11.96 11.96 0 0 0 20 14c-3.3 0-6.3-1.34-8.48-3.51a8 8 0 0 0-11.23-.08L-.03 11.8l1.4 1.44a5.99 5.99 0 0 1 8.42.06A9.97 9.97 0 0 0 16 16a9.96 9.96 0 0 0 7.07-2.93A13.97 13.97 0 0 1 32 17.06l1.39-1.45a15.96 15.96 0 0 0-3.5-3.46zM28.49 4.15L27.07 2.7A11.96 11.96 0 0 0 20 6c-3.3 0-6.3-1.34-8.48-3.51a8 8 0 0 0-11.23-.08L-.03 3.8l1.4 1.44a5.99 5.99 0 0 1 8.42.06A9.97 9.97 0 0 0 16 8a9.96 9.96 0 0 0 7.07-2.93A13.97 13.97 0 0 1 32 9.06l1.39-1.45a15.96 15.96 0 0 0-4.9-3.46z" />
      </svg>
    );
  },
  spa: function SpaIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M16 32C7.16 32 0 24.84 0 16S7.16 0 16 0s16 7.16 16 16-7.16 16-16 16zm0-30C8.27 2 2 8.27 2 16s6.27 14 14 14 14-6.27 14-14S23.73 2 16 2zm4 24h-8v-2h8v2zm2-4h-12v-2h12v2zm-2-8a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 0a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8-2a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm-8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
      </svg>
    );
  },
  breakfast: function BreakfastIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M26 9h-2V7c0-1.65-1.35-3-3-3H9C7.35 4 6 5.35 6 7v2H4v2h2v10c0 1.65 1.35 3 3 3h14c1.65 0 3-1.35 3-3V11h2c1.65 0 3-1.35 3-3V6c0-1.65-1.35-3-3-3zm-2-2h2c.55 0 1 .45 1 1v2c0 .55-.45 1-1 1h-2V7zm-2 0v14c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h12c.55 0 1 .45 1 1z" />
      </svg>
    );
  },
  food: function FoodIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M12 2v10a4 4 0 0 0 3 3.87V30h2V15.87A4 4 0 0 0 20 12V2h-2v10a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V2h-2zm12 0v16h2V2h-2zm-2 18v10h2V20h-2z" />
      </svg>
    );
  },
  hotel: function HotelIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M28 14v-4c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4v4H2v14h2v-4h24v4h2V14h-2zM8 8h16c1.1 0 2 .9 2 2v4H6v-4c0-1.1.9-2 2-2zm20 14H4v-6h24v6z" />
      </svg>
    );
  },
  receipt: function ReceiptIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M26 2H6a2 2 0 0 0-2 2v26l4-2 4 2 4-2 4 2 4-2 4 2V4a2 2 0 0 0-2-2zM6 4h20v22.47l-2-1-4 2-4-2-4 2-4-2-2 1V4zm4 4h12v2H10V8zm0 4h12v2H10v-2zm0 4h8v2h-8v-2z" />
      </svg>
    );
  },
  bar: function BarIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M28.71 4.29A1 1 0 0 0 28 4H4a1 1 0 0 0-.71 1.71l11.71 11.7V26H10v2h12v-2h-5V17.41l11.71-11.7a1 1 0 0 0 0-1.42zM16 14.59L6.41 5h19.18L16 14.59z" />
      </svg>
    );
  },
  ski: function SkiIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M30 26.59l-1.41 1.41-5.66-5.66L20.83 24l2.08 2.08L21.5 27.5l-3.58-3.59-10.6-10.6L2.08 18.5 0 16.41 5.24 11.17l-.83-2.91L6.34 6.34l2.91.83 5.24-5.24L16.59 0l2.08 2.08-5.24 5.24L24 17.91l2.08-2.08L27.5 17.24l-3.59 3.59 2.08 2.08L30 26.59zM12.76 14.17l-6.6 6.6 1.41 1.42 6.6-6.6-1.41-1.42zm-5.23-4.13l-4.1 4.1 1.41 1.41 4.1-4.1-1.41-1.41zm10.3 10.3l6.6 6.6 1.41-1.41-6.6-6.6-1.41 1.41z" />
      </svg>
    );
  },
  defaultIncluded: function DefaultIncludedIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M12.63 26L3.3 16.67l1.4-1.4 7.93 7.91L27.3 8.52l1.4 1.4L12.63 26z" />
      </svg>
    );
  },
  defaultExcluded: function DefaultExcludedIcon({ className }) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className} fill="currentColor">
        <path d="M26.67 6.74L25.26 5.33 16 14.59 6.74 5.33 5.33 6.74 14.59 16l-9.26 9.26 1.41 1.41L16 17.41l9.26 9.26 1.41-1.41L17.41 16z" />
      </svg>
    );
  }
};

function normalizeAmenityText(text) {
  return text.toLowerCase().trim();
}

function getAmenityIcon(label, type) {
  const norm = normalizeAmenityText(label);
  if (norm.includes('saç kurutma') || norm.includes('kurutma')) return AmenitySvgIcons.hairDryer;
  if (norm.includes('wi-fi') || norm.includes('wifi') || norm.includes('internet')) return AmenitySvgIcons.wifi;
  if (norm.includes('otopark') || norm.includes('park')) return AmenitySvgIcons.parking;
  if (norm.includes('havuz') || norm.includes('termal')) return AmenitySvgIcons.pool;
  if (norm.includes('spa') || norm.includes('hamam') || norm.includes('buhar') || norm.includes('masaj')) return AmenitySvgIcons.spa;
  if (norm.includes('kahvalt')) return AmenitySvgIcons.breakfast;
  if (norm.includes('yemek') || norm.includes('açık büfe') || norm.includes('restoran')) return AmenitySvgIcons.food;
  if (norm.includes('konaklama') || norm.includes('gece') || norm.includes('otel') || norm.includes('oda')) return AmenitySvgIcons.hotel;
  if (norm.includes('vergi') || norm.includes('fatura')) return AmenitySvgIcons.receipt;
  if (norm.includes('mini-bar') || norm.includes('minibar') || norm.includes('bar')) return AmenitySvgIcons.bar;
  if (norm.includes('kayak')) return AmenitySvgIcons.ski;

  return type === 'included' ? AmenitySvgIcons.defaultIncluded : AmenitySvgIcons.defaultExcluded;
}

function AmenityItem({ label, type }) {
  const Icon = getAmenityIcon(label, type);
  const isExcluded = type === 'excluded';
  
  return (
    <li className="flex items-start gap-4 py-2.5">
      <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center", isExcluded && "text-on-surface-variant/60")}>
        <Icon className={cn("h-6 w-6", !isExcluded && "text-on-surface")} />
      </div>
      <span className={cn("text-[15px] leading-6", isExcluded ? "text-on-surface-variant/60 line-through" : "text-on-surface")}>
        {label}
      </span>
    </li>
  );
}

function AmenitiesList({ included, notIncluded }) {
  const hasIncluded = included?.length > 0;
  const hasNotIncluded = notIncluded?.length > 0;
  
  if (!hasIncluded && !hasNotIncluded) return null;

  return (
    <DetailSection title="Neler Dahil?">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {hasIncluded && (
          <div>
            <h4 className="mb-2.5 text-sm font-medium text-on-surface">Dahil Olanlar</h4>
            <ul className="space-y-1">
              {included.map((item, i) => (
                <AmenityItem key={i} label={item} type="included" />
              ))}
            </ul>
          </div>
        )}
        {hasNotIncluded && (
          <div>
            <h4 className="mb-2.5 text-sm font-medium text-on-surface">Dahil Olmayanlar</h4>
            <ul className="space-y-1">
              {notIncluded.map((item, i) => (
                <AmenityItem key={i} label={item} type="excluded" />
              ))}
            </ul>
          </div>
        )}
      </div>
    </DetailSection>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */


function CampaignDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: campaign, isLoading, error } = useCampaignBySlug(slug);
  const createOrder = useCreateOrder();


  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [installments, setInstallments] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);

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
      <nav className="mb-4 text-[13px] text-on-surface-variant/60">
        <Link to="/" className="transition-colors hover:text-primary">Ana Sayfa</Link>
        <span className="mx-1.5">›</span>
        <span className="text-on-surface-variant">{campaign.title}</span>
      </nav>

      {/* Title above gallery - Airbnb style */}
      <TitleBar campaign={campaign} />

      {/* Airbnb photo grid */}
      <CampaignGallery images={campaign.images} title={campaign.title} />

      {/* Meta badges */}
      <div className="mt-4 mb-2">
        <MetaBadges campaign={campaign} discount={discount} />
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
        {/* ── Left Column ── */}
        <div>
          {/* Host summary */}
          <HostSummary campaign={campaign} />

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

            <AmenitiesList included={campaign.included} notIncluded={campaign.notIncluded} />

            <AvailabilityCalendar availability={campaign.availability} selectedDate={selectedDate} onSelect={setSelectedDate} />

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

            <ReviewsSection campaign={campaign} />

            <LocationSection campaign={campaign} />

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
            selectedDate={selectedDate}
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
