'use client';

import { useEffect, useState } from 'react';

/**
 * Ticks up by 1 every `intervalMs` for as long as the component is mounted —
 * charts use this to nudge their "live" point on a timer. Runs continuously
 * while this page is open in a tab (that's the only "always on" a client-side
 * page can honestly offer — nothing browser-rendered runs when no tab has it
 * open; a true 24/7 feed would need a always-on backend pushing real prices).
 */
export function useLiveTick(intervalMs = 2000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}
