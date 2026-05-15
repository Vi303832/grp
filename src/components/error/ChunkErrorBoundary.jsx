import { useRouteError } from 'react-router-dom';

export default function ChunkErrorBoundary() {
  const error = useRouteError();
  
  const isChunkError = 
    error?.name === 'ChunkLoadError' || 
    error?.message?.includes('Failed to fetch dynamically imported module');
                       
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6 text-center">
      <span className="material-symbols-outlined mb-4 text-5xl text-on-surface-variant/40">
        error_outline
      </span>
      <h2 className="mb-2 font-headline text-xl font-semibold text-on-surface">
        Bağlantı Hatası
      </h2>
      <p className="mb-6 text-[15px] text-on-surface-variant max-w-sm">
        {isChunkError 
          ? 'Sayfa güncellendi veya bağlantı koptu. Devam etmek için lütfen sayfayı yenileyin.' 
          : 'Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin.'}
      </p>
      <button 
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-on-primary shadow-sm transition hover:bg-primary/90 hover:shadow"
      >
        Sayfayı Yenile
      </button>
    </div>
  );
}
