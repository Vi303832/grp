import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/ui';

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }) => {
    try {
      await resetPassword(email);
    } catch {
      toast.error('Bir hata oluştu. E-posta adresinizi kontrol edin.');
    }
  };

  if (isSubmitSuccessful) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-container-low px-4">
        <div className="w-full max-w-md rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 font-headline font-extrabold text-2xl text-on-surface">E-posta Gönderildi</h2>
          <p className="mb-6 font-label text-sm text-on-surface-variant leading-relaxed">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
            Gelen kutunuzu kontrol edin.
          </p>
          <Link to="/giris" className="font-label text-sm font-semibold text-primary hover:underline underline-offset-2">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface-container-low px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-headline font-extrabold text-3xl text-on-surface">Şifremi Unuttum</h1>
          <p className="mt-2 font-label text-sm text-on-surface-variant">
            Kayıtlı e-posta adresine şifre sıfırlama bağlantısı gönderilecektir.
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
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>

          <p className="mt-5 text-center font-label text-sm text-on-surface-variant">
            <Link to="/giris" className="font-semibold text-primary hover:underline underline-offset-2">
              Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
