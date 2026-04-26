import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/ui';
import AuthShell from './components/AuthShell';

const schema = z
  .object({
    displayName: z
      .string()
      .min(2, 'Ad en az 2 karakter olmalı')
      .max(50, 'Ad en fazla 50 karakter olabilir'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, 'Geçerli bir telefon numarası girin')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(6, 'Şifre en az 6 karakter olmalı')
      .max(64, 'Şifre çok uzun'),
    passwordConfirm: z.string(),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Şifreler eşleşmiyor',
  });

export default function RegisterPage() {
  const { register: authRegister } = useAuthStore();
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState(null);
  const [isProceeding, setIsProceeding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await authRegister(data);
      toast.success('Hesabınız oluşturuldu!');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('[RegisterPage] Kayıt hatası:', err);

      const messages = {
        'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
        'auth/weak-password': 'Şifre çok zayıf.',
        'auth/invalid-email': 'Geçersiz e-posta adresi.',
        'auth/network-request-failed': 'Ağ hatası. Bağlantınızı kontrol edin.',
        'permission-denied':
          'Profil kaydı reddedildi. Lütfen tekrar deneyin veya destek ile iletişime geçin.',
      };

      const code = err?.code ?? '';
      toast.error(
        messages[code] ?? `Kayıt başarısız: ${err?.message ?? 'Bilinmeyen hata'}`,
      );
    }
  };

  const sidePanelData = {
    title: 'Avantajlarla dolu dünyaya katıl',
    description: 'Hesabını oluştur, sevdiğin işletmelerin kampanyalarından hemen faydalanmaya başla.',
    features: [
      { icon: 'local_offer', text: 'Size özel indirimler' },
      { icon: 'notifications_active', text: 'Yeni fırsatlardan ilk sen haberdar ol' },
      { icon: 'history', text: 'Tüm siparişlerin elinin altında' },
    ],
  };

  if (!isProceeding) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-container-low px-4 py-12 md:py-16">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-8 md:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">Nasıl devam etmek istersiniz?</h1>
            <p className="mt-2 text-sm font-label text-on-surface-variant">
              GRP Kampanya hesabınıza uygun kayıt türünü seçin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setSelectedType('user')}
              className={`flex flex-col items-center p-6 text-center rounded-2xl border-2 transition-all ${
                selectedType === 'user' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-outline-variant/30 hover:border-outline hover:shadow-md'
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container mb-4">
                <span className="material-symbols-outlined text-3xl">person</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Kullanıcı</h3>
              <p className="text-sm font-label text-on-surface-variant leading-relaxed">
                Kuponlarını, siparişlerini ve fırsatlarını yönet.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('business')}
              className={`flex flex-col items-center p-6 text-center rounded-2xl border-2 transition-all ${
                selectedType === 'business' 
                  ? 'border-primary bg-primary/5 shadow-md' 
                  : 'border-outline-variant/30 hover:border-outline hover:shadow-md'
              }`}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container mb-4">
                <span className="material-symbols-outlined text-3xl">storefront</span>
              </div>
              <h3 className="font-headline font-bold text-lg text-on-surface mb-2">İşletme</h3>
              <p className="text-sm font-label text-on-surface-variant leading-relaxed">
                Kampanyalarını ve kupon doğrulamalarını yönet.
              </p>
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-outline-variant/20">
            <Button
              disabled={!selectedType}
              onClick={() => setIsProceeding(true)}
              className="px-8"
            >
              Devam
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If Business is selected, we just show a message.
  if (selectedType === 'business') {
    return (
      <AuthShell
        title="İşletme Başvurusu"
        subtitle="İşletmeniz için GRP Kampanya paneline erişim."
        onBack={() => setIsProceeding(false)}
        footer={
          <p className="text-center font-label text-sm text-on-surface-variant">
            Daha önce başvuru yaptıysanız:{' '}
            <Link to="/giris" className="font-semibold text-primary hover:underline underline-offset-2">
              Giriş Yap
            </Link>
          </p>
        }
      >
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-high/30 p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-4">storefront</span>
          <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Çok Yakında!</h3>
          <p className="text-sm font-label text-on-surface-variant mb-6">
            İşletme hesabı için başvuru formu çok yakında eklenecektir. Şu an için işletme panelini kullanmak veya detaylı bilgi almak için lütfen bizimle iletişime geçin.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setIsProceeding(false)}>
            Geri Dön
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Hesap oluştur"
      subtitle="Fırsatları kaydet, kuponlarını takip et ve satın alma geçmişini görüntüle."
      sidePanel={sidePanelData}
      onBack={() => setIsProceeding(false)}
      footer={
        <p className="text-center font-label text-sm text-on-surface-variant">
          Zaten hesabın var mı?{' '}
          <Link to="/giris" className="font-semibold text-primary hover:underline underline-offset-2">
            Giriş Yap
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Ad Soyad"
          type="text"
          autoComplete="name"
          placeholder="Ahmet Yılmaz"
          error={errors.displayName?.message}
          {...register('displayName')}
        />
        <Input
          label="E-posta"
          type="email"
          autoComplete="email"
          placeholder="ornek@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Telefon (isteğe bağlı)"
          type="tel"
          autoComplete="tel"
          placeholder="05xxxxxxxxx"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Şifre"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Şifre Tekrar"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.passwordConfirm?.message}
            {...register('passwordConfirm')}
          />
        </div>

        <Button type="submit" className="w-full h-12 text-[15px] font-bold mt-2" loading={isSubmitting}>
          Kayıt Ol
        </Button>
      </form>
    </AuthShell>
  );
}
