import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, PackageCheck, Clock, CheckCircle2, X } from 'lucide-react';

import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import RiskBadge from '../components/ui/RiskBadge';
import Pagination, { paginate } from '../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingGrid } from '../components/ui/States';
import { disposalService, errorMessage, type DisposalRecord } from '../services/extraServices';
import { isOversight } from '../auth/roles';

const REASON: Record<string, string> = {
  EXPIRED: 'Expired',
  RECALL_COMPLETED: 'Recall completed',
  TAMPER_DETECTED: 'Tampering detected',
  MANUAL_REVOCATION: 'Revoked by regulator',
};

export default function Disposals() {
  const [records, setRecords] = useState<DisposalRecord[] | null>(null);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof disposalService.summary>> | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [action, setAction] = useState<{ record: DisposalRecord; status: 'RETURNED' | 'DESTROYED' } | null>(null);
  const [notes, setNotes] = useState('');
  const [evidence, setEvidence] = useState('');
  const myUserId = JSON.parse(localStorage.getItem('user') || '{}')?.id;

  const load = async () => {
    setError('');
    try {
      const [r, s] = await Promise.all([disposalService.list(), disposalService.summary()]);
      setRecords(r);
      setSummary(s);
    } catch (e) {
      setError(errorMessage(e, 'Could not load disposal records'));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!action) return;
    try {
      await disposalService.update(action.record.id, { status: action.status, notes: notes || undefined, evidence: evidence || undefined });
      toast.success(`Marked as ${action.status.toLowerCase()}`);
      setAction(null);
      setNotes('');
      setEvidence('');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const filtered = (records ?? []).filter((r) => filter === 'ALL' || r.status === filter);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Disposal & Returns"
          subtitle="Expired, recalled and tampered stock must be returned or destroyed so it permanently leaves the supply chain."
          icon={<Trash2 size={22} />}
        />

        {error && <ErrorState message={error} onRetry={load} />}
        {!records && !error && <LoadingGrid />}

        {summary && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Pending notices" value={summary.pending} hint={`${summary.unitsPending} units to remove`} icon={<Clock size={20} />} tone="yellow" />
            <StatCard label="Returned" value={summary.returned} icon={<PackageCheck size={20} />} />
            <StatCard label="Destroyed" value={summary.destroyed} icon={<Trash2 size={20} />} tone="slate" />
            <StatCard label="Completion rate" value={`${summary.completionRate}%`} icon={<CheckCircle2 size={20} />} tone="green" />
          </div>
        )}

        {records && (
          <div className="card overflow-hidden">
            <div className="flex flex-wrap gap-2 p-4 sm:p-6 pb-4">
              {['ALL', 'NOTICE_ISSUED', 'RETURNED', 'DESTROYED'].map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setFilter(f);
                    setPage(1);
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${filter === f ? 'bg-teal-600 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  {f === 'ALL' ? 'All' : f === 'NOTICE_ISSUED' ? 'Pending' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {filtered.length === 0 ? (
              <div className="px-6 pb-6">
                <EmptyState title="No disposal notices" message="Notices appear automatically when a batch you hold is revoked." icon={<PackageCheck size={26} />} />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Batch</th>
                        {isOversight() && <th className="px-4 py-3">Holder</th>}
                        <th className="px-4 py-3">Units</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Issued</th>
                        <th className="px-6 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginate(filtered, page, 10).map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3">
                            <p className="font-medium text-slate-900">{r.batch.drugName}</p>
                            <p className="text-xs text-slate-500">{r.batch.batchNumber}</p>
                          </td>
                          {isOversight() && <td className="px-4 py-3 text-slate-700">{r.user.organizationName ?? r.user.fullName}</td>}
                          <td className="px-4 py-3 text-slate-700">{r.quantity}</td>
                          <td className="px-4 py-3 text-slate-700">{REASON[r.reason] ?? r.reason}</td>
                          <td className="px-4 py-3">
                            <RiskBadge value={r.status} label={r.status === 'NOTICE_ISSUED' ? 'Pending' : undefined} />
                            {r.evidence && <span className="block text-xs text-slate-500 mt-1">Evidence: {r.evidence}</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            {r.status !== 'DESTROYED' && r.userId === myUserId ? (
                              <div className="flex justify-end gap-2">
                                {r.status === 'NOTICE_ISSUED' && (
                                  <button onClick={() => setAction({ record: r, status: 'RETURNED' })} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                                    Returned
                                  </button>
                                )}
                                <button onClick={() => setAction({ record: r, status: 'DESTROYED' })} className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700">
                                  Destroyed
                                </button>
                              </div>
                            ) : (
                              <span className="block text-right text-xs text-slate-400">{r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '—'}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={10} total={filtered.length} onChange={setPage} />
              </>
            )}
          </div>
        )}
      </div>

      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-md p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Mark as {action.status.toLowerCase()}</h2>
              <button onClick={() => setAction(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {action.record.quantity} units of {action.record.batch.drugName} ({action.record.batch.batchNumber}) will be removed from your inventory.
            </p>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Evidence (certificate no., photo URL)</span>
              <input value={evidence} onChange={(e) => setEvidence(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 outline-none focus:border-teal-600" />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Notes</span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 outline-none focus:border-teal-600" />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setAction(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={submit} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
