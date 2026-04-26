import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { Button, Input } from '../../components/ui';
import AuthShell from './components/AuthShell';

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
      <AuthShell
        title="E-posta Gönderildi"
        subtitle="Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin."
        footer={
          <p className="text-center">
            <Link to="/giris" className="font-label text-sm font-semibold text-primary hover:underline underline-offset-2">
              Giriş sayfasına dön
            </Link>
          </p>
        }
      >
        <div className="mx-auto my-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
          <span className="material-symbols-outlined text-3xl text-primary">
            mark_email_read
          </span>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Şifreni sıfırla"
      subtitle="E-posta adresini gir, sana sıfırlama bağlantısı gönderelim."
      footer={
        <p className="text-center font-label text-sm text-on-surface-variant">
          <Link to="/giris" className="font-semibold text-primary hover:underline underline-offset-2">
            Giriş sayfasına dön
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
        <Button type="submit" className="w-full h-12 text-[15px] font-bold" loading={isSubmitting}>
          Sıfırlama Bağlantısı Gönder
        </Button>
      </form>
    </AuthShell>
  );
}
