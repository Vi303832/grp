import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Kampanyalar', to: '/kampanyalar' },
      { label: 'İşletme Başvurusu', to: '/isletme-basvurusu' },
      { label: 'Hediye Kartları', to: '/kampanyalar' },
    ],
  },
  {
    heading: 'Hesap',
    links: [
      { label: 'Giriş Yap', to: '/giris' },
      { label: 'Kayıt Ol', to: '/kayit' },
      { label: 'Siparişlerim', to: '/hesabim/siparislerim' },
      { label: 'Kuponlarım', to: '/hesabim/kuponlarim' },
    ],
  },
  {
    heading: 'Destek',
    links: [
      { label: 'destek@grp.com.tr', href: 'mailto:destek@grp.com.tr' },
      { label: 'Gizlilik Politikası', href: '#' },
      { label: 'Kullanım Koşulları', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-surface text-on-dark-surface">
      <div className="mx-auto max-w-7xl px-8 pt-20 pb-10">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 mb-16">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="font-headline italic text-2xl text-primary-container tracking-tight">
              GRP
            </Link>
            <p className="mt-4 text-sm font-label leading-relaxed text-on-dark-surface/55 max-w-xs">
              Bursa'nın en iyi kampanyaları tek platformda. Harcamadan tasarruf edin.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-5 text-xs font-label font-bold uppercase tracking-widest text-primary-container/70">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className="text-sm font-label text-on-dark-surface/55 hover:text-on-dark-surface transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-sm font-label text-on-dark-surface/55 hover:text-on-dark-surface transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-label text-on-dark-surface/55">
            © {new Date().getFullYear()} GRP Kampanya. Tüm hakları saklıdır.
          </p>
          {/* Social icons */}
          <div className="flex items-center gap-5">
            <a href="#" className="text-on-dark-surface/55 hover:text-on-dark-surface transition-colors" aria-label="Instagram">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="text-on-dark-surface/55 hover:text-on-dark-surface transition-colors" aria-label="Twitter / X">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
