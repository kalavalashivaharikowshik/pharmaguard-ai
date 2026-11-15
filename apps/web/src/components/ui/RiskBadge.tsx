const STYLES: Record<string, string> = {
  LOW: 'bg-green-100 text-green-700',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
  // batch / task statuses (Safe → Green, Recalled → Red, Expired → Orange, Pending → Yellow, Transferred → Blue)
  ACTIVE: 'bg-green-100 text-green-700',
  SAFE: 'bg-green-100 text-green-700',
  APPROVED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  RECALLED: 'bg-red-100 text-red-700',
  REVOKED: 'bg-red-100 text-red-700',
  OVERDUE: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-orange-100 text-orange-700',
  PENDING: 'bg-yellow-100 text-yellow-800',
  NOTICE_ISSUED: 'bg-yellow-100 text-yellow-800',
  TRANSFERRED: 'bg-blue-100 text-blue-700',
  RETURNED: 'bg-blue-100 text-blue-700',
  DESTROYED: 'bg-slate-200 text-slate-700',
};

export default function RiskBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[value] ?? 'bg-slate-100 text-slate-700'}`}>
      {label ?? value.replace(/_/g, ' ')}
    </span>
  );
}
