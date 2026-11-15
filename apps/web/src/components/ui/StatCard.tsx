import type { ReactNode } from 'react';

const TONES = {
  blue: 'bg-teal-50 text-teal-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-700',
  orange: 'bg-orange-50 text-orange-700',
  yellow: 'bg-yellow-50 text-yellow-700',
  slate: 'bg-slate-100 text-slate-700',
} as const;

export default function StatCard({
  label,
  value,
  icon,
  tone = 'blue',
  hint,
  onClick,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: keyof typeof TONES;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      className={`card p-5 ${onClick ? 'cursor-pointer transition hover:border-teal-300' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        {icon && <div className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center ${TONES[tone]}`}>{icon}</div>}
      </div>
    </div>
  );
}
