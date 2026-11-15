import { useEffect, useState } from 'react';
import { Sparkles, AlertTriangle, ShieldAlert, PackageX, TrendingUp, TrendingDown, Minus, RefreshCw, Lightbulb } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import RiskBadge from '../components/ui/RiskBadge';
import Pagination, { paginate } from '../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingGrid } from '../components/ui/States';
import { CHART, tooltipStyle } from '../components/ui/chartTheme';
import { aiService, type Insights } from '../services/aiService';
import { errorMessage } from '../services/extraServices';

export default function AIInsights() {
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await aiService.insights());
    } catch (e) {
      setError(errorMessage(e, 'Could not load AI insights'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const chartData = data
    ? [
        ...data.forecast.history.map((h) => ({ month: h.month, actual: h.units, forecast: null as number | null })),
        ...data.forecast.forecast.map((f) => ({ month: f.month, actual: null as number | null, forecast: f.units })),
      ]
    : [];
  // Join the two lines at the last actual month
  if (data && chartData.length > data.forecast.history.length) {
    chartData[data.forecast.history.length - 1].forecast = chartData[data.forecast.history.length - 1].actual;
  }

  const risks = (data?.risks ?? []).filter(
    (r) => !search || `${r.batchNumber} ${r.drugName}`.toLowerCase().includes(search.toLowerCase()),
  );
  const TrendIcon = data?.forecast.trend === 'INCREASING' ? TrendingUp : data?.forecast.trend === 'DECREASING' ? TrendingDown : Minus;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="AI Insights"
          subtitle="Expiry prediction, recall-risk scoring, demand forecast and recommendations for your scope."
          icon={<Sparkles size={22} />}
          actions={
            <button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          }
        />

        {loading && !data && <LoadingGrid />}
        {error && <ErrorState message={error} onRetry={load} />}

        {data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Batches analysed" value={data.counts.batchesAnalysed} icon={<Sparkles size={20} />} />
              <StatCard label="High expiry risk" value={data.counts.highExpiryRisk} hint={`~${data.counts.unitsAtRisk} units may expire unsold`} icon={<AlertTriangle size={20} />} tone="orange" />
              <StatCard label="High recall risk" value={data.counts.highRecallRisk} icon={<ShieldAlert size={20} />} tone="red" />
              <StatCard label="Low stock (≤14 days)" value={data.counts.lowStock} icon={<PackageX size={20} />} tone="yellow" />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">AI summary</h2>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">{data.aiProvider}</span>
                </div>
                <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-700">
                  {data.narrative
                    .split('\n')
                    .filter(Boolean)
                    .map((line, i) => (
                      <p key={i} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                        <span>{line.replace(/^[-•*]\s*/, '')}</span>
                      </p>
                    ))}
                </div>
                <p className="mt-4 text-xs text-slate-500">Generated {new Date(data.generatedAt).toLocaleString()}</p>
              </div>

              <div className="card p-6 lg:col-span-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">Demand forecast (units moved)</h2>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-600">
                    <TrendIcon size={16} /> {data.forecast.trend.toLowerCase()}
                  </span>
                </div>
                <div className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ left: -10, right: 10 }}>
                      <defs>
                        <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART.blue} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={CHART.blue} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" stroke={CHART.axis} fontSize={12} tickLine={false} />
                      <YAxis stroke={CHART.axis} fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip {...tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 13 }} />
                      <Area type="monotone" dataKey="actual" name="Actual" stroke={CHART.blue} strokeWidth={2} fill="url(#actualFill)" connectNulls={false} />
                      <Area type="linear" dataKey="forecast" name="Forecast" stroke={CHART.green} strokeWidth={2} strokeDasharray="6 4" fill="none" connectNulls={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-xs text-slate-500">{data.forecast.method}</p>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                <Lightbulb size={18} className="text-emerald-600" /> Recommendations
              </h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {data.recommendations.map((r, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-slate-900">{r.title}</p>
                      <RiskBadge value={r.priority} />
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{r.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="flex flex-col gap-3 p-6 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Batch risk scores</h2>
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search batch or drug"
                  className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-teal-600"
                />
              </div>
              {risks.length === 0 ? (
                <div className="p-6 pt-0">
                  <EmptyState title="No batches to analyse" message="Risk scores appear once you hold active stock." />
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-6 py-3">Batch</th>
                          <th className="px-4 py-3">Stock</th>
                          <th className="px-4 py-3">Expiry</th>
                          <th className="px-4 py-3">Expiry risk</th>
                          <th className="px-4 py-3">Recall risk</th>
                          <th className="px-6 py-3">Why</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {paginate(risks, page, 10).map((r) => (
                          <tr key={r.batchId} className="hover:bg-slate-50">
                            <td className="px-6 py-3">
                              <p className="font-medium text-slate-900">{r.drugName}</p>
                              <p className="text-xs text-slate-500">{r.batchNumber}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {r.unitsInStock}
                              <span className="block text-xs text-slate-500">{r.dailyMovement}/day</span>
                            </td>
                            <td className="px-4 py-3 text-slate-700">{r.daysToExpiry <= 0 ? 'Expired' : `${r.daysToExpiry} days`}</td>
                            <td className="px-4 py-3">
                              <RiskBadge value={r.expiryRiskLevel} label={`${r.expiryRiskLevel} · ${r.expiryRisk}`} />
                            </td>
                            <td className="px-4 py-3">
                              <RiskBadge value={r.recallRiskLevel} label={`${r.recallRiskLevel} · ${r.recallRisk}`} />
                            </td>
                            <td className="px-6 py-3 text-xs text-slate-600 max-w-xs">{r.reasons.slice(0, 2).join('; ') || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={page} pageSize={10} total={risks.length} onChange={setPage} />
                </>
              )}
            </div>

            {data.stock.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-900">Stock-out prediction</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.stock.map((s) => (
                    <div key={s.batchNumber} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900">{s.drugName}</p>
                        {s.lowStock && <RiskBadge value="HIGH" label="Low stock" />}
                      </div>
                      <p className="text-xs text-slate-500">{s.batchNumber}</p>
                      <p className="mt-3 text-2xl font-bold text-slate-900">{s.daysOfStock} days</p>
                      <p className="text-xs text-slate-500">
                        {s.unitsInStock} units at {s.dailyMovement}/day · runs out {new Date(s.stockoutDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
