'use client';

import { CheckCircle2 } from 'lucide-react';

export default function AmenityCard({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
        selected
          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
          : 'border-gray-100 bg-gray-50 hover:border-primary/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-bold text-secondary text-sm">{label}</span>
        <CheckCircle2 className={`h-5 w-5 ${selected ? 'text-primary' : 'text-gray-300'}`} />
      </div>
    </button>
  );
}
