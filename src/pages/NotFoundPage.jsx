import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-7xl font-extrabold text-orange-500">404</span>
      <h1 className="text-2xl font-bold text-gray-800">Sayfa Bulunamadı</h1>
      <p className="text-sm text-gray-500">
        Aradığınız sayfa taşınmış veya silinmiş olabilir.
      </p>
      <Link to="/">
        <Button>Ana Sayfaya Dön</Button>
      </Link>
    </div>
  );
}
