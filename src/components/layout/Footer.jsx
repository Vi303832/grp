import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-2xl font-extrabold text-orange-500">
              GRP
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Bursa'nın en iyi kampanyaları tek platformda.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/kampanyalar" className="hover:text-gray-700">Kampanyalar</Link></li>
              <li><Link to="/isletme-basvurusu" className="hover:text-gray-700">İşletme Başvurusu</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Hesap</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link to="/giris" className="hover:text-gray-700">Giriş Yap</Link></li>
              <li><Link to="/kayit" className="hover:text-gray-700">Kayıt Ol</Link></li>
              <li><Link to="/hesabim" className="hover:text-gray-700">Hesabım</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Destek</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><a href="mailto:destek@grp.com.tr" className="hover:text-gray-700">destek@grp.com.tr</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} GRP Kampanya. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
