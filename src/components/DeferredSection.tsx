import React, { useState, useEffect, useRef } from 'react';

interface DeferredSectionProps {
  children: React.ReactNode;
  fallbackHeight?: string;
  rootMargin?: string;
  id?: string;
}

/**
 * DeferredSection uses Intersection Observer to defer rendering of below-the-fold
 * content until it enters or is about to enter the viewport.
 * Reserves height via fallbackHeight to guarantee 0 CLS (Cumulative Layout Shift).
 */
export const DeferredSection: React.FC<DeferredSectionProps> = ({
  children,
  fallbackHeight = 'min-h-[250px]',
  rootMargin = '250px 0px',
  id,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;
    const element = containerRef.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef} id={id} className={!isVisible ? fallbackHeight : undefined}>
      {isVisible ? children : <div className={fallbackHeight} aria-hidden="true" />}
    </div>
  );
};
