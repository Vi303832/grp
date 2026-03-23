import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import PageWrapper from '../components/layout/PageWrapper';

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Bursa'nın En İyi Kampanyaları
          </h1>
          <p className="max-w-xl text-lg text-orange-100">
            Restoranlar, spa'lar, aktiviteler ve daha fazlası — tek platformda,
            özel fiyatlarla.
          </p>
          <Link to="/kampanyalar">
            <Button variant="secondary" size="lg">
              Kampanyaları Keşfet
            </Button>
          </Link>
        </div>
      </section>

      <PageWrapper>
        <div className="py-16 text-center text-gray-400">
          <p className="text-lg font-medium">Kampanyalar yakında burada!</p>
          <p className="mt-2 text-sm">Milestone 2'de bu alan doldurulacak.</p>
        </div>
      </PageWrapper>
    </>
  );
}
