import { Helmet } from 'react-helmet-async';

const DEFAULT_TITLE = "GRP Kampanya — Bursa'nın En İyi Fırsatları";
const DEFAULT_DESCRIPTION =
  "Bursa'nın en iyi kampanya ve kupon platformu. Spa, restoran, aktivite ve daha fazlası için özel fırsatlar.";

/**
 * Sayfa bazlı meta tag bileşeni.
 *
 * Kullanım:
 *   <Seo title="Kampanyalar" description="Tüm aktif kampanyalar" />
 *
 * - title verilirse "{title} — GRP Kampanya" formatında olur
 * - Open Graph + Twitter meta tag'leri otomatik eklenir
 */
export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  image,
  noIndex = false,
  children,
}) {
  const fullTitle = title ? `${title} — GRP Kampanya` : DEFAULT_TITLE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {children}
    </Helmet>
  );
}
