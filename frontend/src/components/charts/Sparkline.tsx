'use client';

import { useEffect, useRef, useState } from 'react';
import { useLiveTick } from './useLiveTick';

/** 12-point sparkline: de-emphasized line, with a live end-point that drifts gently on a timer. */
export default function Sparkline({ roi, seed, color = '#006AFF' }: { roi: number; seed: string; color?: string }) {
  const points = useHistoricalPoints(roi, seed);
  const anchor = points[points.length - 1];
  const liveRef = useRef(anchor);
  const [live, setLive] = useState(anchor);
  const tick = useLiveTick(2200);

  useEffect(() => {
    liveRef.current = anchor;
    setLive(anchor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roi, seed]);

  useEffect(() => {
    if (tick === 0) return;
    const current = liveRef.current;
    const pull = (anchor - current) * 0.08;
    const jitter = (Math.random() - 0.5) * anchor * 0.006;
    const next = current + pull + jitter;
    liveRef.current = next;
    setLive(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const full = [...points, live];
  const w = 120;
  const h = 36;
  const min = Math.min(...full);
  const max = Math.max(...full);
  const range = max - min || 1;
  const xFor = (i: number) => (i / (full.length - 1)) * w;
  const yFor = (v: number) => h - ((v - min) / range) * (h - 6) - 3;
  const d = full.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" aria-hidden="true">
      <path d={d} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xFor(full.length - 1)} cy={yFor(live)} r={3} fill={color} style={{ transition: 'cy 1100ms ease' }} />
    </svg>
  );
}

/** Stable 12-point historical curve for this property — recomputed only if roi/seed change. */
function useHistoricalPoints(roi: number, seed: string): number[] {
  const ref = useRef<{ roi: number; seed: string; points: number[] } | null>(null);
  if (!ref.current || ref.current.roi !== roi || ref.current.seed !== seed) {
    const rand = mulberry32(seedFromString(seed));
    const monthlyRate = roi / 100 / 12;
    const points: number[] = [100];
    for (let m = 1; m < 12; m++) {
      const noise = (rand() - 0.5) * 0.008;
      points.push(points[m - 1] * (1 + monthlyRate + noise));
    }
    ref.current = { roi, seed, points };
  }
  return ref.current.points;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}
