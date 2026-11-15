import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Boxes,
  Package,
  ShieldAlert,
  ShieldCheck,
  CalendarClock,
  ClipboardCheck,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  ScanLine,
  Bot,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import DashboardLayout from '../components/layout/DashboardLayout';
import StatCard from '../components/ui/StatCard';
import RiskBadge from '../components/ui/RiskBadge';
import { ErrorState, LoadingGrid } from '../components/ui/States';
import { CHART, SEVERITY_COLORS, tooltipStyle } from '../components/ui/chartTheme';
import { dashboardService } from '../services/dashboardService';
import { aiService, type Insights } from '../services/aiService';
import { errorMessage } from '../services/extraServices';
import type { DashboardSummary } from '../types/dashboard';
import { hasRole, isManufacturer, isOversight, role, ROLE_LABEL } from '../auth/roles';

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const load = async () => {
    setError('');
    try {
      setSummary(await dashboardService.getSummary());
    } catch (e) {
      setError(errorMessage(e, 'Could not load the dashboard'));
    }
    aiService
      .insights()
      .then(setInsights)
      .catch(() => undefined);
  };

  useEffect(() => {
    load();
  }, []);

  const riskBuckets = insights
    ? (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((lvl) => ({
        level: lvl,
        expiry: insights.risks.filter((r) => r.expiryRiskLevel === lvl).length,
      }))
    : [];

  const quickActions = [
    isManufacturer() && { label: 'Create batch', path: '/batches', icon: <Package size={18} /> },
    hasRole(['MANUFACTURER', 'DISTRIBUTOR']) && { label: 'New transfer', path: '/transfers', icon: <ArrowLeftRight size={18} /> },
    { label: 'Verify a batch', path: '/blockchain', icon: <ScanLine size={18} /> },
    { label: 'Ask the AI assistant', path: '/assistant', icon: <Bot size={18} /> },
    isOversight() && { label: 'Review violations', path: '/violations', icon: <ShieldAlert size={18} /> },
  ].filter(Boolean) as { label: string; path: string; icon: React.ReactNode }[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#0F4C81] via-[#155A94] to-[#2E8B57] p-6 sm:p-8 text-white">
          <p className="text-sm font-medium text-white/80">{ROLE_LABEL[role() ?? ''] ?? ''} dashboard</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold">Welcome back{user?.fullName ? `, ${user.fullName}` : ''}</h1>
          <p className="mt-2 max-w-2xl text-white/85">
            {summary?.scope === 'NETWORK'
              ? 'Network-wide view of pharmaceutical safety across every organisation.'
              : 'Your organisation’s stock, recalls and safety actions at a glance.'}
          </p>
        </div>

        {error && <ErrorState message={error} onRetry={load} />}
        {!summary && !error && <LoadingGrid />}

        {summary && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Inventory units" value={summary.inventoryUnits.toLocaleString()} icon={<Boxes size={20} />} onClick={() => navigate('/inventory')} />
              <StatCard
                label={summary.scope === 'NETWORK' ? 'Active batches' : 'Batches in scope'}
                value={summary.scope === 'NETWORK' ? summary.activeBatches : summary.totalBatches}
                hint={`${summary.revokedBatches} revoked`}
                icon={<Package size={20} />}
                tone="green"
              />
              <StatCard label="Active recalls" value={summary.activeRecalls} icon={<ShieldAlert size={20} />} tone="red" onClick={() => navigate('/recalls')} />
              <StatCard label="Expiring in 30 days" value={summary.expiringSoon ?? 0} icon={<CalendarClock size={20} />} tone="orange" onClick={() => navigate('/ai-insights')} />
              <StatCard label="Open recall tasks" value={summary.pendingRecallTasks ?? 0} icon={<ClipboardCheck size={20} />} tone="yellow" onClick={() => navigate('/recalls')} />
              <StatCard label="Pending disposals" value={summary.pendingDisposals ?? 0} icon={<Trash2 size={20} />} tone="slate" onClick={() => navigate('/disposals')} />
              <StatCard label="Unread notifications" value={summary.notifications} icon={<Bell size={20} />} onClick={() => navigate('/notifications')} />
              <StatCard label="Revoked batches" value={summary.revokedBatches} icon={<ShieldCheck size={20} />} tone="slate" onClick={() => navigate('/revocation')} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Stock movement & forecast</h2>
                  <button onClick={() => navigate('/ai-insights')} className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">
                    AI insights <ArrowRight size={14} />
                  </button>
                </div>
                <div className="mt-4 h-64">
                  {insights ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={[
                          ...insights.forecast.history.map((h) => ({ month: h.month, units: h.units })),
                          ...insights.forecast.forecast.map((f) => ({ month: `${f.month}*`, forecast: f.units })),
                        ]}
                        margin={{ left: -10, right: 10 }}
                      >
                        <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" stroke={CHART.axis} fontSize={12} tickLine={false} />
                        <YAxis stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipStyle} />
                        <Area dataKey="units" name="Units moved" stroke={CHART.blue} fill={CHART.blue} fillOpacity={0.15} strokeWidth={2} />
                        <Area dataKey="forecast" name="Forecast" stroke={CHART.green} fill="none" strokeDasharray="6 4" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full animate-pulse rounded-xl bg-slate-100" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">* forecast months</p>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Expiry risk</h2>
                <div className="mt-4 h-52">
                  {insights ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={riskBuckets} margin={{ left: -20, right: 5 }}>
                        <XAxis dataKey="level" stroke={CHART.axis} fontSize={11} tickLine={false} />
                        <YAxis stroke={CHART.axis} fontSize={12} allowDecimals={false} tickLine={false} axisLine={false} />
                        <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--color-slate-100)' }} />
                        <Bar dataKey="expiry" name="Batches" radius={[6, 6, 0, 0]}>
                          {riskBuckets.map((b) => (
                            <Cell key={b.level} fill={SEVERITY_COLORS[b.level]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full animate-pulse rounded-xl bg-slate-100" />
                  )}
                </div>
                {insights?.recommendations[0] && (
                  <div className="mt-3 rounded-xl bg-teal-50 p-3 text-sm">
                    <p className="flex items-center gap-1.5 font-medium text-teal-700">
                      <Sparkles size={14} /> {insights.recommendations[0].title}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
                <div className="mt-4 space-y-2">
                  {quickActions.map((a) => (
                    <button
                      key={a.path + a.label}
                      onClick={() => navigate(a.path)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-left text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                    >
                      <span className="flex items-center gap-3 font-medium">
                        {a.icon} {a.label}
                      </span>
                      <ArrowRight size={16} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Recent transfers</h2>
                {summary.recentTransfers?.length ? (
                  <ul className="mt-3 divide-y divide-slate-200">
                    {summary.recentTransfers.map((t) => (
                      <li key={t.id} className="py-2.5">
                        <p className="text-sm font-medium text-slate-900">
                          {t.quantity} × {t.batch.drugName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {t.fromUser.organizationName ?? t.fromUser.fullName} → {t.toUser.organizationName ?? t.toUser.fullName} · {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No transfers yet.</p>
                )}
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Recent recalls</h2>
                {summary.recentRecalls?.length ? (
                  <ul className="mt-3 divide-y divide-slate-200">
                    {summary.recentRecalls.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">{r.batch.drugName}</p>
                          <p className="text-xs text-slate-500">
                            {r.recallNumber} · {r.batch.batchNumber}
                          </p>
                        </div>
                        <RiskBadge value={r.status === 'ACTIVE' ? r.severity : 'COMPLETED'} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">No recalls. All clear.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
