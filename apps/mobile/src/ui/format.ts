const DAY = 86_400_000;

export function fmtDate(d?: string | Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtDateTime(d?: string | Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function timeAgo(d?: string | Date | null) {
  if (!d) return '';
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`;
  return fmtDate(d);
}

export function daysUntil(d?: string | Date | null) {
  if (!d) return Infinity;
  return Math.ceil((new Date(d).getTime() - Date.now()) / DAY);
}

/** "Due in 5h" / "Overdue by 2d" */
export function countdown(d?: string | Date | null) {
  if (!d) return '';
  const ms = new Date(d).getTime() - Date.now();
  const abs = Math.abs(ms);
  const label = abs >= DAY ? `${Math.round(abs / DAY)}d` : abs >= 3_600_000 ? `${Math.round(abs / 3_600_000)}h` : `${Math.max(1, Math.round(abs / 60_000))}m`;
  return ms >= 0 ? `Due in ${label}` : `Overdue by ${label}`;
}

export function dayGroup(d: string | Date) {
  const date = new Date(d);
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const t = date.getTime();
  if (t >= start) return 'Today';
  if (t >= start - DAY) return 'Yesterday';
  if (t >= start - 6 * DAY) return 'This week';
  return 'Earlier';
}

export function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  REGULATOR: 'Regulator',
  MANUFACTURER: 'Manufacturer',
  DISTRIBUTOR: 'Distributor',
  PHARMACY: 'Pharmacy',
  HOSPITAL: 'Hospital',
};

export const can = {
  transfer: (role?: string) => role === 'MANUFACTURER' || role === 'DISTRIBUTOR',
  oversight: (role?: string) => role === 'SUPER_ADMIN' || role === 'REGULATOR',
};

export function errMsg(e: any, fallback = 'Something went wrong') {
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join(', ');
  return m || e?.message || fallback;
}
