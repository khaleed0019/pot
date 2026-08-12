'use client';

const STEPS = [
  'Basic',
  'Details',
  'Amenities',
  'Media',
  'Location',
  'Fees',
  'Review',
];

export default function StepProgress({ step }: { step: number }) {
  return (
    <div className="mb-10">
      <div className="h-2 bg-gray-200 rounded-full w-full overflow-hidden">
        <div
          className="h-2 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-4 gap-1 overflow-x-auto">
        {STEPS.map((label, i) => (
          <span
            key={label}
            className={`text-xs font-bold whitespace-nowrap ${step >= i + 1 ? 'text-primary' : 'text-gray-400'}`}
          >
            {i + 1}. {label}
          </span>
        ))}
      </div>
    </div>
  );
}
