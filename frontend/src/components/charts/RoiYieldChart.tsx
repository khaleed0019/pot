'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Property } from '@/lib/useProperties';

// Same validated pair used elsewhere on this page — blue/green, ΔE well above floor.
const config: ChartConfig = {
  roi: { label: 'Projected ROI', color: '#006AFF' },
  rentalYield: { label: 'Rental Yield', color: '#16A34A' },
};

type Row = { id: string; label: string; roi: number; rentalYield: number };

export default function RoiYieldChart({ properties }: { properties: Property[] }) {
  const rows = useMemo<Row[]>(
    () =>
      properties
        .filter((p) => p.investmentData?.roi != null && p.investmentData?.rentalYield != null)
        .sort((a, b) => b.investmentData!.roi! - a.investmentData!.roi!)
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          label: p.city || p.title,
          roi: p.investmentData!.roi!,
          rentalYield: p.investmentData!.rentalYield!,
        })),
    [properties]
  );

  if (rows.length === 0) {
    return <p className="text-gray-400 font-bold text-sm py-12 text-center">Not enough performance data yet.</p>;
  }

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-[300px] w-full">
        <BarChart data={rows} margin={{ left: 4, right: 12, top: 8, bottom: 0 }} barGap={4} barCategoryGap="20%">
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 9)}…` : v)}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} tickFormatter={(v: number) => `${v}%`} />
          <ChartTooltip cursor={{ fill: 'var(--border)', opacity: 0.3 }} content={<ChartTooltipContent indicator="dot" />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="roi" fill="var(--color-roi)" radius={[4, 4, 0, 0]} maxBarSize={22} />
          <Bar dataKey="rentalYield" fill="var(--color-rentalYield)" radius={[4, 4, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ChartContainer>

      <table className="sr-only">
        <caption>Projected ROI versus rental yield by market</caption>
        <thead>
          <tr>
            <th>Market</th>
            <th>Projected ROI</th>
            <th>Rental Yield</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.label}</td>
              <td>{r.roi.toFixed(1)}%</td>
              <td>{r.rentalYield.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
