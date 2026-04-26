export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
  sidePanel,
  onBack,
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 md:py-16 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/auth-italy-bg.jpg')] bg-cover bg-center bg-no-repeat blur-[3px] scale-105 z-0" />
      <div className="absolute inset-0 bg-black/45 z-0 pointer-events-none" />
      <div className={`relative z-10 w-full ${sidePanel ? 'max-w-5xl' : 'max-w-md'} flex overflow-hidden rounded-3xl border border-white/20 bg-white/95 backdrop-blur-sm shadow-2xl`}>
        
        {/* Sol/Sağ Panel - Sadece masaüstünde ve eğer sidePanel verildiyse görünür */}
        {sidePanel && (
          <div className="hidden w-1/2 flex-col justify-center bg-primary p-12 text-on-primary md:flex relative overflow-hidden">
             {/* Arkaya dekoratif desen */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed to-primary opacity-90" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="mb-4 font-headline text-3xl font-bold leading-tight">
                {sidePanel.title}
              </h2>
              <p className="mb-8 font-body text-lg text-on-primary/80">
                {sidePanel.description}
              </p>
              
              {sidePanel.features && (
                <ul className="space-y-4">
                  {sidePanel.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                        <span className="material-symbols-outlined text-[18px]">
                          {feature.icon}
                        </span>
                      </div>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Ana Form Alanı */}
        <div className={`w-full p-8 md:p-12 ${sidePanel ? 'md:w-1/2' : ''}`}>
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 flex items-center gap-2 text-sm font-label font-medium text-on-surface-variant hover:text-on-surface transition-colors group"
            >
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              Giriş türünü değiştir
            </button>
          )}
          <div className="mb-8">
            <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 font-label text-sm text-on-surface-variant">
                {subtitle}
              </p>
            )}
          </div>

          <div className="mb-6">{children}</div>

          {footer && <div className="mt-6 border-t border-outline-variant/30 pt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
