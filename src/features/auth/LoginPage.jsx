import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/ui';
import AuthShell from './components/AuthShell';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
});

export default function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate(from, { replace: true });
    } catch (err) {
      const messages = {
        'auth/user-not-found': 'Bu e-posta adresiyle kayıt bulunamadı.',
        'auth/wrong-password': 'Şifre hatalı.',
        'auth/invalid-credential': 'E-posta veya şifre hatalı.',
        'auth/too-many-requests': 'Çok fazla deneme. Lütfen bekleyin.',
      };
      toast.error(messages[err.code] ?? 'Giriş başarısız. Tekrar deneyin.');
    }
  };

  const sidePanelData = {
    title: 'Fırsatlarını tek yerden yönet',
    description: 'Bursa\'nın en iyi kampanyalarına ulaş, satın alımlarını takip et ve kuponlarını kolayca kullan.',
    features: [
      { icon: 'confirmation_number', text: 'Kuponlarına anında eriş' },
      { icon: 'receipt_long', text: 'Sipariş geçmişini görüntüle' },
      { icon: 'security', text: 'Güvenli ödeme altyapısı' },
    ],
  };

  return (
    <AuthShell
      title="Tekrar hoş geldin"
      subtitle="Kuponlarını, siparişlerini ve fırsatlarını yönetmek için giriş yap."
      sidePanel={sidePanelData}
      footer={
        <p className="text-center font-label text-sm text-on-surface-variant">
          Hesabın yok mu?{' '}
          <Link to="/kayit" className="font-semibold text-primary hover:underline underline-offset-2">
            Kayıt Ol
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="E-posta"
          type="email"
          autoComplete="email"
          placeholder="ornek@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        
        <div>
          <Input
            label="Şifre"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="mt-2 text-right">
            <Link
              to="/sifremi-unuttum"
              className="text-xs font-label font-medium text-primary hover:text-primary-focus transition-colors"
            >
              Şifremi unuttum
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-[15px] font-bold" loading={isSubmitting}>
          Giriş Yap
        </Button>
      </form>
    </AuthShell>
  );
}
