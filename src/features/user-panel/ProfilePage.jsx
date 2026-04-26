import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { formatDate } from '../../lib/utils';

/* ─── Sabitler ─── */

const CITY_OPTIONS = [
  { value: 'bursa', label: 'Bursa' },
  { value: 'istanbul', label: 'İstanbul' },
  { value: 'ankara', label: 'Ankara' },
  { value: 'izmir', label: 'İzmir' },
  { value: 'antalya', label: 'Antalya' },
  { value: 'eskisehir', label: 'Eskişehir' },
];

const CITY_DISPLAY = Object.fromEntries(
  CITY_OPTIONS.map(({ value, label }) => [value, label]),
);

const DEFAULT_INTERESTS = [
  { icon: 'shopping_bag', label: 'Alışveriş' },
  { icon: 'park', label: 'Açık hava' },
  { icon: 'music_note', label: 'Canlı müzik' },
  { icon: 'photo_camera', label: 'Fotoğrafçılık' },
  { icon: 'pets', label: 'Hayvanlar' },
  { icon: 'local_cafe', label: 'Kahve' },
  { icon: 'museum', label: 'Müzeler' },
  { icon: 'menu_book', label: 'Okuma' },
  { icon: 'movie', label: 'Sinema' },
];

const schema = z.object({
  displayName: z
    .string()
    .min(2, 'Ad en az 2 karakter olmalı')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, 'Geçerli bir telefon numarası girin')
    .optional()
    .or(z.literal('')),
  cityId: z.string().min(1, 'Şehir seçmelisiniz'),
});

/* ─── Yardımcı Componentler ─── */

/** Profil Kartı — Airbnb "hero" stili */
function ProfileHeroCard({ userProfile, user }) {
  const displayName = userProfile?.displayName || 'Kullanıcı';
  const initial = displayName.charAt(0).toUpperCase();
  const photoURL = user?.photoURL;
  const cityLabel = CITY_DISPLAY[userProfile?.cityId] || userProfile?.cityId;

  return (
    <div
      className="mx-auto flex w-full max-w-xs flex-col items-center rounded-3xl border border-[#EBEBEB] bg-white px-8 py-8"
      style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}
    >
      {/* Avatar */}
      <div className="relative mb-4">
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="h-24 w-24 rounded-full object-cover ring-2 ring-white"
          />
        ) : (
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ backgroundColor: '#222222' }}
          >
            {initial}
          </div>
        )}
        {/* Doğrulama badge */}
        <span
          className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-white"
          style={{ backgroundColor: '#FF385C' }}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>
            verified
          </span>
        </span>
      </div>

      {/* İsim */}
      <h2
        className="font-headline text-[22px] font-bold tracking-tight"
        style={{ color: '#222222' }}
      >
        {displayName}
      </h2>

      {/* Şehir */}
      <p className="mt-0.5 text-sm" style={{ color: '#717171' }}>
        {cityLabel ? `${cityLabel}, Türkiye` : 'Türkiye'}
      </p>
    </div>
  );
}

/** Bilgi Satırı — ikon + metin */
function ProfileInfoRow({ icon, label, value, muted = false }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span
        className="material-symbols-outlined text-[20px]"
        style={{ color: '#717171' }}
      >
        {icon}
      </span>
      <span
        className="text-[15px]"
        style={{ color: muted ? '#717171' : '#222222' }}
      >
        {label}
        {value && (
          <>
            : <span className="font-medium">{value}</span>
          </>
        )}
      </span>
    </div>
  );
}

/** İlgi alanı item */
function InterestItem({ icon, label }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className="material-symbols-outlined text-[22px]"
        style={{ color: '#222222' }}
      >
        {icon}
      </span>
      <span className="text-[15px]" style={{ color: '#222222' }}>
        {label}
      </span>
    </div>
  );
}

/** İlgi alanları grid */
function InterestsGrid({ userProfile }) {
  const interests =
    userProfile?.interests?.length > 0
      ? userProfile.interests
      : DEFAULT_INTERESTS;

  return (
    <div>
      <h3
        className="mb-4 font-headline text-[20px] font-bold tracking-tight"
        style={{ color: '#222222' }}
      >
        İlgi alanlarım
      </h3>
      <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
        {interests.map(({ icon, label }) => (
          <InterestItem key={label} icon={icon} label={label} />
        ))}
      </div>
    </div>
  );
}

/** Edit Form — Airbnb minimal stili */
function ProfileEditForm({
  userProfile,
  user,
  onSave,
  onCancel,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      cityId: userProfile?.cityId || 'bursa',
    },
  });

  return (
    <div
      className="w-full max-w-lg rounded-3xl border border-[#EBEBEB] bg-white p-8"
      style={{ boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}
    >
      <h2
        className="mb-6 font-headline text-[22px] font-bold tracking-tight"
        style={{ color: '#222222' }}
      >
        Profilini düzenle
      </h2>

      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        {/* Ad Soyad */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="edit-displayName"
            className="text-sm font-medium"
            style={{ color: '#222222' }}
          >
            Ad Soyad
          </label>
          <input
            id="edit-displayName"
            {...register('displayName')}
            className="w-full rounded-lg border border-[#B0B0B0] bg-white px-4 py-3 text-[15px] text-[#222222] placeholder-[#B0B0B0] transition-colors focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
          />
          {errors.displayName && (
            <p className="text-xs text-red-600">{errors.displayName.message}</p>
          )}
        </div>

        {/* E-posta (readonly) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: '#222222' }}>
            E-posta
          </label>
          <input
            readOnly
            value={user?.email || ''}
            className="w-full cursor-not-allowed rounded-lg border border-[#EBEBEB] bg-[#F7F7F7] px-4 py-3 text-[15px] text-[#717171]"
          />
        </div>

        {/* Telefon */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="edit-phone"
            className="text-sm font-medium"
            style={{ color: '#222222' }}
          >
            Telefon
          </label>
          <input
            id="edit-phone"
            placeholder="05xxxxxxxxx"
            {...register('phone')}
            className="w-full rounded-lg border border-[#B0B0B0] bg-white px-4 py-3 text-[15px] text-[#222222] placeholder-[#B0B0B0] transition-colors focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
          />
          {errors.phone && (
            <p className="text-xs text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Şehir Select */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="edit-cityId"
            className="text-sm font-medium"
            style={{ color: '#222222' }}
          >
            Şehir
          </label>
          <select
            id="edit-cityId"
            {...register('cityId')}
            className="w-full appearance-none rounded-lg border border-[#B0B0B0] bg-white px-4 py-3 text-[15px] text-[#222222] transition-colors focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
          >
            {CITY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {errors.cityId && (
            <p className="text-xs text-red-600">{errors.cityId.message}</p>
          )}
        </div>

        {/* Butonlar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-[#222222] px-6 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#F7F7F7] disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#222222' }}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Kaydediliyor…
              </span>
            ) : (
              'Kaydet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Ana Sayfa Componenti ─── */

function ProfilePage() {
  const { user, userProfile, updateUserProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (data) => {
    try {
      await updateUserProfile(data);
      toast.success('Profil bilgileriniz güncellendi.');
      setIsEditing(false);
    } catch (error) {
      console.error('[ProfilePage] Güncelleme hatası:', error);
      toast.error('Profil güncellenirken bir hata oluştu. Tekrar deneyin.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  /* Bio — şimdilik UI placeholder */
  const bio =
    userProfile?.bio || 'Gezmeyi ve yeni fırsatlar keşfetmeyi seven biri.';

  /* Üyelik tarihi */
  const memberSince = formatDate(userProfile?.createdAt);

  return (
    <div className="pb-12">
      {/* ── Başlık ── */}
      <div className="mb-8 flex items-center gap-4">
        <h1
          className="font-headline text-[26px] font-extrabold tracking-tight md:text-[32px]"
          style={{ color: '#222222' }}
        >
          Hakkımda
        </h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full border border-[#222222] px-4 py-1.5 text-sm font-semibold text-[#222222] transition-colors hover:bg-[#F7F7F7]"
          >
            Düzenle
          </button>
        )}
      </div>

      {isEditing ? (
        /* ── Edit Mode ── */
        <ProfileEditForm
          userProfile={userProfile}
          user={user}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        /* ── View Mode ── */
        <div className="space-y-10">
          {/* Profil Kartı */}
          <ProfileHeroCard userProfile={userProfile} user={user} />

          {/* Bilgi Satırları */}
          <div
            className="border-t border-[#EBEBEB] pt-6"
            style={{ maxWidth: 480 }}
          >
            <ProfileInfoRow
              icon="work"
              label="Yaptığım iş"
              value={userProfile?.jobTitle || 'Belirtilmemiş'}
              muted={!userProfile?.jobTitle}
            />
            <ProfileInfoRow
              icon="verified_user"
              label="Kimlik doğrulandı"
              value="Hesap doğrulandı"
            />
            <ProfileInfoRow
              icon="phone"
              label="Telefon"
              value={userProfile?.phone || 'Eklenmemiş'}
              muted={!userProfile?.phone}
            />
            {memberSince && (
              <ProfileInfoRow
                icon="calendar_month"
                label="Üyelik tarihi"
                value={memberSince}
              />
            )}
          </div>

          {/* Bio */}
          <div className="border-t border-[#EBEBEB] pt-6">
            <p className="text-[15px] leading-relaxed" style={{ color: '#222222', maxWidth: 480 }}>
              {bio}
            </p>
          </div>

          {/* İlgi Alanları */}
          <div className="border-t border-[#EBEBEB] pt-6">
            <InterestsGrid userProfile={userProfile} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
export { ProfilePage as Component };
