import { useEffect, useState } from 'react';

import { TrackingDeps } from './deps';

/** Current instant from the injected clock, refreshed every `intervalMs` (timers render at <=1 Hz). */
export function useNow(intervalMs = 1000, enabled = true) {
  const { clock } = TrackingDeps.useDeps();
  const [now, setNow] = useState(() => clock.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(clock.now()), intervalMs);
    return () => clearInterval(id);
  }, [clock, intervalMs, enabled]);
  return now;
}
