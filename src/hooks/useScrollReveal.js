import { useState, useEffect, useRef } from 'react';

/**
 * useScrollReveal — lightweight IntersectionObserver hook for scroll-triggered
 * fade-up entrance animations with optional delay.
 *
 * Returns [ref, isRevealed] so the class is bound to React state and
 * persists across any component re-renders.
 */

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useScrollReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  delay = 0,
  once = true,
} = {}) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el || isRevealed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => setIsRevealed(true), delay);
            } else {
              setIsRevealed(true);
            }
            if (once) observer.unobserve(el);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, delay, once, isRevealed]);

  return [ref, isRevealed];
}

/**
 * Per-item scroll reveal hook for list items with staggered delays.
 * Returns [ref, isRevealed].
 */
export function useScrollRevealItem(index = 0, staggerDelay = 80) {
  const ref = useRef(null);
  const [isRevealed, setIsRevealed] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el || isRevealed) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const d = (index % 6) * staggerDelay;
            if (d > 0) {
              setTimeout(() => setIsRevealed(true), d);
            } else {
              setIsRevealed(true);
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, staggerDelay, isRevealed]);

  return [ref, isRevealed];
}
