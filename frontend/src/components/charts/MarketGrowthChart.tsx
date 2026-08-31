'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Property } from '@/lib/useProperties';
import { useLiveTick } from './useLiveTick';

const MONTHS = 12;

// Validated categorical order (node scripts/validate_palette.js — all checks pass).
// Fixed assignment by rank (highest ROI first), never re-cycled per render.
const SERIES_COLORS = ['#006AFF', '#16A34A', '#9333EA', '#EA580C'];

/** Deterministic PRNG so the same property always draws the same curve. */
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

type Series = { key: string; label: string; roi: number; points: number[] };

/** Builds a 12-month value index (start = 100) per city, compounding each city's own ROI with small organic noise. */
function buildSeries(properties: Property[]): Series[] {
  const byCity = new Map<string, { city: string; roi: number }>();
  for (const p of properties) {
    const roi = p.investmentData?.roi;
    const city = p.city;
    if (roi == null || !city) continue;
    const existing = byCity.get(city);
    if (!existing || roi > existing.roi) byCity.set(city, { city, roi });
  }
  return Array.from(byCity.values())
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 4)
    .map(({ city, roi }) => {
      const rand = mulberry32(seedFromString(city));
      const monthlyRate = roi / 100 / 12;
      const points: number[] = [100];
      for (let m = 1; m < MONTHS; m++) {
        const noise = (rand() - 0.5) * 0.006; // ±0.3% organic wobble
        points.push(points[m - 1] * (1 + monthlyRate + noise));
      }
      return { key: city, label: city, roi, points };
    });
}

// city names carry spaces/commas — sanitize into a safe object key / CSS var / dataKey.
function slug(s: string): string {
  return s.replace(/[^a-zA-Z0-9]+/g, '_');
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MarketGrowthChart({ properties }: { properties: Property[] }) {
  const series = useMemo(() => buildSeries(properties), [properties]);
  const keyed = useMemo(() => series.map((s, i) => ({ ...s, slug: slug(s.key), color: SERIES_COLORS[i] })), [series]);

  // The "live" point: starts at each series' last historical value, then
  // drifts on a bounded random walk with a gentle pull back toward that
  // anchor — real movement (up and down every tick) without wandering off
  // to an implausible value over a long session.
  const anchors = useMemo(
    () => Object.fromEntries(keyed.map((s) => [s.slug, s.points[MONTHS - 1]])),
    [keyed]
  );
  const liveRef = useRef<Record<string, number>>({});
  const [liveValues, setLiveValues] = useState<Record<string, number>>(anchors);
  const tick = useLiveTick(1800);

  useEffect(() => {
    liveRef.current = anchors;
    setLiveValues(anchors);
    // Re-anchor whenever the underlying series changes (new property data) — otherwise
    // keep the running walk so it doesn't jump on unrelated re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyed]);

  useEffect(() => {
    if (tick === 0) return;
    const next: Record<string, number> = {};
    for (const s of keyed) {
      const current = liveRef.current[s.slug] ?? anchors[s.slug];
      const anchor = anchors[s.slug];
      const pull = (anchor - current) * 0.08;
      const jitter = (Math.random() - 0.5) * anchor * 0.004;
      next[s.slug] = current + pull + jitter;
    }
    liveRef.current = next;
    setLiveValues(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const config = useMemo<ChartConfig>(
    () => Object.fromEntries(keyed.map((s) => [s.slug, { label: s.label, color: s.color }])),
    [keyed]
  );

  const data = useMemo(() => {
    const rows = MONTH_LABELS.map((month, i) => ({
      month,
      ...Object.fromEntries(keyed.map((s) => [s.slug, Math.round(s.points[i] * 10) / 10])),
    }));
    rows.push({
      month: 'Now',
      ...Object.fromEntries(keyed.map((s) => [s.slug, Math.round((liveValues[s.slug] ?? s.points[MONTHS - 1]) * 10) / 10])),
    });
    return rows;
  }, [keyed, liveValues]);

  if (series.length === 0) {
    return <p className="text-gray-400 font-bold text-sm py-12 text-center">Not enough market data yet.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-green-600 uppercase tracking-widest">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          Live
        </div>
      </div>

      <ChartContainer config={config} className="aspect-auto h-[300px] w-full">
        <LineChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={36}
            domain={['dataMin - 2', 'dataMax + 2']}
            tickFormatter={(v: number) => `${Math.round(v)}`}
          />
          <ChartTooltip
            cursor={{ stroke: 'var(--border)', strokeWidth: 1 }}
            content={<ChartTooltipContent indicator="line" />}
          />
          <ChartLegend content={<ChartLegendContent />} />
          {keyed.map((s) => (
            <Line
              key={s.slug}
              dataKey={s.slug}
              type="monotone"
              stroke={`var(--color-${s.slug})`}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
            />
          ))}
        </LineChart>
      </ChartContainer>

      {/* Screen-reader / no-JS table twin */}
      <table className="sr-only">
        <caption>Indexed value trend by market, starting at 100, with a live-updating current point</caption>
        <thead>
          <tr>
            <th>Month</th>
            {keyed.map((s) => (
              <th key={s.slug}>{s.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.month}>
              <td>{row.month}</td>
              {keyed.map((s) => (
                <td key={s.slug}>{(row as Record<string, number | string>)[s.slug]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
