import { useCallback, useEffect, useMemo, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveals text word by word (a purely visual effect: the full text is already available to
 * assistive technology elsewhere). Long replies are sped up so they never take more than ~5 s.
 */
export function useTypewriter(text: string, animate: boolean, msPerWord = 35) {
  // Split into words and the whitespace between them so line breaks survive.
  const tokens = useMemo(() => text.split(/(\s+)/).filter((t) => t.length > 0), [text]);
  const instant = !animate || prefersReducedMotion();
  const [count, setCount] = useState(instant ? tokens.length : 0);

  useEffect(() => {
    if (count >= tokens.length) return;
    const words = Math.max(1, tokens.length / 2);
    const delay = Math.min(msPerWord, 5000 / words);
    const timer = setTimeout(() => setCount((c) => Math.min(tokens.length, c + 2)), delay);
    return () => clearTimeout(timer);
  }, [count, tokens.length, msPerWord]);

  const skip = useCallback(() => setCount(tokens.length), [tokens.length]);

  return { tokens: tokens.slice(0, count), done: count >= tokens.length, skip };
}
