import { useState } from 'react';
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

  const [selectedType, setSelectedType] = useState(null);
  const [isProceeding, setIsProceeding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      await login(data);
      
      const userRole = useAuthStore.getState().role;
      
      if (selectedType === 'business') {
        if (userRole === 'business' || userRole === 'admin') {
          navigate('/isletme', { replace: true });
        } else {
          toast('Bu hesap işletme hesabı değil. Kullanıcı profiline yönlendiriliyorsunuz.', { icon: 'ℹ️' });
          navigate('/hesabim', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
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

  if (!isProceeding) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-container-low px-4 py-12 md:py-16">
        <div className="w-full max-w-2xl bg-surface-container-lowest rounded-3xl border border-outline-variant/20 p-8 md:p-12 shadow-sm">
          <div className="mb-10 text-center">
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">Nasıl devam etmek istersiniz?</h1>
            <p className="mt-2 text-sm font-label text-on-surface-variant">
              GRP Kampanya hesabınıza uygun giriş türünü seçin.
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

  const isBusiness = selectedType === 'business';
  const formTitle = isBusiness ? 'İşletme girişi' : 'Tekrar hoş geldin';
  const formSubtitle = isBusiness 
    ? 'İşletme paneline erişmek için giriş yap.' 
    : 'Kuponlarını, siparişlerini ve fırsatlarını yönetmek için giriş yap.';

  return (
    <AuthShell
      title={formTitle}
      subtitle={formSubtitle}
      sidePanel={sidePanelData}
      onBack={() => setIsProceeding(false)}
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
