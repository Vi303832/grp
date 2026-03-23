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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Giriş Yap</h1>
          <p className="mb-6 text-sm text-gray-500">
            Hesabın yok mu?{' '}
            <Link to="/kayit" className="font-medium text-orange-500 hover:underline">
              Kayıt Ol
            </Link>
          </p>

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
                className="text-xs text-gray-500 hover:text-orange-500"
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
