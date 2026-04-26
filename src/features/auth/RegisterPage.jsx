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

  return (
    <AuthShell
      title="Hesap oluştur"
      subtitle="Fırsatları kaydet, kuponlarını takip et ve satın alma geçmişini görüntüle."
      sidePanel={sidePanelData}
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
