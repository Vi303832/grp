import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/ui';

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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-container-low px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-headline font-extrabold text-3xl text-on-surface">Hoş Geldiniz</h1>
          <p className="mt-2 font-label text-sm text-on-surface-variant">
            Hesabın yok mu?{' '}
            <Link to="/kayit" className="font-semibold text-primary hover:underline underline-offset-2">
              Kayıt Ol
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="E-posta"
              type="email"
              autoComplete="email"
              placeholder="ornek@email.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Şifre"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="text-right">
              <Link
                to="/sifremi-unuttum"
                className="text-xs font-label text-on-surface-variant hover:text-primary transition-colors"
              >
                Şifremi unuttum
              </Link>
            </div>

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Giriş Yap
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
