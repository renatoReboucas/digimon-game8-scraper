// @ts-nocheck
'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`scroll-to-top${isVisible ? ' is-visible' : ''}`}
      type="button"
      title="Rolar para o começo"
      aria-label="Rolar para o começo"
      onClick={scrollToTop}
    >
      <ChevronUp aria-hidden="true" size={22} strokeWidth={2.2} />
    </button>
  );
}
