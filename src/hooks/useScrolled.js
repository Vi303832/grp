import { useEffect, useState } from 'react';

/**
 * Sayfa dikey scroll pozisyonuna göre boolean döndürür.
 *
 * @param {number} threshold - Kaç px scroll'dan sonra true olsun (default 80).
 * @returns {boolean}
 */
export default function useScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(() =>
    typeof window !== 'undefined' ? window.scrollY > threshold : false,
  );

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > threshold);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
}
