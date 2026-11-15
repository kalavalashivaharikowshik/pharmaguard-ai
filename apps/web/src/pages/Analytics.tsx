import { useEffect, useState } from 'react';
import { BarChart3, Clock, ShieldCheck, ScanLine, FileWarning, Boxes, Factory, ArrowLeftRight, ShieldAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';

import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import { ErrorState, LoadingGrid } from '../components/ui/States';
import { CHART, MONTHS, SEVERITY_COLORS, tooltipStyle } from '../components/ui/chartTheme';
import { analyticsService, errorMessage } from '../services/extraServices';

type Dash = Awaited<ReturnType<typeof analyticsService.dashboard>>;

export default function Analytics() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [dash, setDash] = useState<Dash | null>(null);
  const [safety, setSafety] = useState<any>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      const [d, s] = await Promise.all([analyticsService.dashboard(year), analyticsService.safety()]);
      setDash(d);
      setSafety(s);
    } catch (e) {
      setError(errorMessage(e, 'Could not load analytics'));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  const monthly = dash
    ? MONTHS.map((m, i) => ({
        month: m,
        inventory: dash.inventoryTrend.find((x) => x.month === i + 1)?.quantity ?? 0,
        transfers: dash.transferTrend.find((x) => x.month === i + 1)?.transfers ?? 0,
        recalls: dash.recallTrend.find((x) => x.month === i + 1)?.recalls ?? 0,
      }))
    : [];
  const distribution = dash ? Object.entries(dash.recallDistribution).map(([name, value]) => ({ name, value })) : [];
  const hasRecalls = distribution.some((d) => d.value > 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          subtitle="Network-wide trends and safety performance metrics."
          icon={<BarChart3 size={22} />}
          actions={
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              aria-label="Year"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800"
            >
              {[0, 1, 2].map((d) => {
                const y = new Date().getFullYear() - d;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          }
        />

        {error && <ErrorState message={error} onRetry={load} />}
        {!dash && !error && <LoadingGrid />}

        {dash && safety && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Units in network" value={dash.summary.inventory.toLocaleString()} icon={<Boxes size={20} />} />
              <StatCard label={`Transfers ${year}`} value={dash.summary.transfers} icon={<ArrowLeftRight size={20} />} tone="green" />
              <StatCard label={`Recalls ${year}`} value={dash.summary.recalls} icon={<ShieldAlert size={20} />} tone="red" />
              <StatCard label="Manufacturers" value={dash.summary.manufacturers} icon={<Factory size={20} />} tone="slate" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Monthly transfers & recalls</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthly} margin={{ left: -15, right: 10 }}>
                      <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" stroke={CHART.axis} fontSize={12} tickLine={false} />
                      <YAxis stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Line type="monotone" dataKey="transfers" name="Transfers" stroke={CHART.blue} strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="recalls" name="Recalls" stroke={CHART.red} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Monthly inventory added</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} margin={{ left: -5, right: 10 }}>
                      <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" stroke={CHART.axis} fontSize={12} tickLine={false} />
                      <YAxis stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--color-slate-100)' }} />
                      <Bar dataKey="inventory" name="Units" fill={CHART.green} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Recall severity distribution</h2>
                <div className="mt-4 h-72">
                  {hasRecalls ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                          {distribution.map((d) => (
                            <Cell key={d.name} fill={SEVERITY_COLORS[d.name]} />
                          ))}
                        </Pie>
                        <Tooltip {...tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: 13 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-500">No recalls recorded yet.</div>
                  )}
                </div>
              </div>

              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Batches per manufacturer</h2>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dash.manufacturerStats} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" stroke={CHART.axis} fontSize={12} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke={CHART.axis} fontSize={12} width={130} tickLine={false} />
                      <Tooltip {...tooltipStyle} cursor={{ fill: 'var(--color-slate-100)' }} />
                      <Bar dataKey="batches" name="Batches" fill={CHART.blue} radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <h2 className="pt-2 text-xl font-bold text-slate-900">Safety & performance</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Avg recall completion"
                value={safety.recallPerformance.averageCompletionHours === null ? '—' : `${safety.recallPerformance.averageCompletionHours} h`}
                hint={`${safety.recallPerformance.completedRecalls} of ${safety.recallPerformance.totalRecalls} recalls completed`}
                icon={<Clock size={20} />}
              />
              <StatCard
                label="Recall task completion"
                value={safety.recallPerformance.taskCompletionRate === null ? '—' : `${safety.recallPerformance.taskCompletionRate}%`}
                hint={`${safety.recallPerformance.overdueTasks} overdue (escalated)`}
                icon={<ShieldCheck size={20} />}
                tone="green"
              />
              <StatCard
                label="Violations (30 days)"
                value={safety.compliance.violationsLast30Days}
                hint={`Disposal completion ${safety.compliance.disposalCompletionRate ?? '—'}%`}
                icon={<FileWarning size={20} />}
                tone="red"
              />
              <StatCard
                label="Verification scans"
                value={safety.counterfeitPrevention.verificationScans}
                hint={`${safety.counterfeitPrevention.suspiciousDetections} suspicious (${safety.counterfeitPrevention.detectionRate}%)`}
                icon={<ScanLine size={20} />}
                tone="orange"
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
