import { useEffect, useState } from 'react';
import { useEngine } from '@/lib/store';

/** Drives real time-box countdowns and auto-expiry. A single 1s heartbeat
 * updates `now` (so countdown labels re-render) and asks the engine to expire
 * any grant whose time-box has lapsed — proving authorisation is time-boxed. */
export function useTick(): number {
  const [now, setNow] = useState(() => Date.now());
  const tick = useEngine((s) => s.tick);
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Date.now());
      tick();
    }, 1000);
    return () => window.clearInterval(id);
  }, [tick]);
  return now;
}
