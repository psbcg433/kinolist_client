import { useEffect, useState } from 'react';

export function useCountdown(targetMs: number): number {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((targetMs - Date.now()) / 1000)));

  useEffect(() => {
    const t = window.setInterval(() => {
      const r = Math.max(0, Math.floor((targetMs - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) window.clearInterval(t);
    }, 1000);
    return () => window.clearInterval(t);
  }, [targetMs]);

  return remaining;
}
