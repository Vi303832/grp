import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/ui';

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
      const messages = {
        'auth/email-already-in-use': 'Bu e-posta adresi zaten kullanılıyor.',
        'auth/weak-password': 'Şifre çok zayıf.',
      };
      toast.error(messages[err.code] ?? 'Kayıt başarısız. Tekrar deneyin.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-container-low px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-headline font-extrabold text-3xl text-on-surface">Hesap Oluştur</h1>
          <p className="mt-2 font-label text-sm text-on-surface-variant">
            Zaten hesabın var mı?{' '}
            <Link to="/giris" className="font-semibold text-primary hover:underline underline-offset-2">
              Giriş Yap
            </Link>
          </p>
        </div>

        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm">
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

            <Button type="submit" className="w-full" loading={isSubmitting}>
              Kayıt Ol
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
