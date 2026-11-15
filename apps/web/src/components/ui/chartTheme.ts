/** Chart colours aligned with the brand and status palette. */
export const CHART = {
  blue: '#0F4C81',
  blueLight: '#4A8BC4',
  green: '#2E8B57',
  red: '#DC2626',
  orange: '#EA580C',
  yellow: '#CA8A04',
  slate: '#94A3B8',
  grid: 'var(--color-slate-200)',
  axis: 'var(--color-slate-500)',
};

export const SEVERITY_COLORS: Record<string, string> = {
  LOW: CHART.green,
  MEDIUM: CHART.yellow,
  HIGH: CHART.orange,
  CRITICAL: CHART.red,
};

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const tooltipStyle = {
  contentStyle: {
    background: 'var(--tooltip-bg)',
    border: '1px solid var(--color-slate-200)',
    borderRadius: 12,
    fontSize: 13,
  },
  labelStyle: { color: 'var(--color-slate-700)', fontWeight: 600 },
};
