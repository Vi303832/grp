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
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">E-posta Gönderildi</h2>
          <p className="mb-6 text-sm text-gray-500">
            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.
            Gelen kutunuzu kontrol edin.
          </p>
          <Link to="/giris" className="text-sm font-medium text-orange-500 hover:underline">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Şifremi Unuttum</h1>
          <p className="mb-6 text-sm text-gray-500">
            Kayıtlı e-posta adresine şifre sıfırlama bağlantısı gönderilecektir.
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
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sıfırlama Bağlantısı Gönder
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            <Link to="/giris" className="font-medium text-orange-500 hover:underline">
              Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
