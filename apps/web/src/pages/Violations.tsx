import { useEffect, useState } from 'react';
import { FileWarning } from 'lucide-react';

import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import RiskBadge from '../components/ui/RiskBadge';
import Pagination, { paginate } from '../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingGrid } from '../components/ui/States';
import { errorMessage, violationService, type Violation } from '../services/extraServices';

const TYPES: Record<string, string> = {
  EXPIRED_SALE_ATTEMPT: 'Expired sale attempt',
  RECALLED_SALE_ATTEMPT: 'Recalled sale attempt',
  REVOKED_SALE_ATTEMPT: 'Revoked sale attempt',
  TAMPER_DETECTED: 'Tampering detected',
  UNAUTHORIZED_TRANSFER: 'Unauthorized transfer',
  RECALL_OVERDUE: 'Recall overdue',
  UNKNOWN_PRODUCT_SCAN: 'Unknown product (possible counterfeit)',
};

export default function Violations() {
  const [items, setItems] = useState<Violation[] | null>(null);
  const [type, setType] = useState('');
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const load = async () => {
    setError('');
    try {
      setItems(await violationService.list(type || undefined));
      setPage(1);
    } catch (e) {
      setError(errorMessage(e, 'Could not load violations'));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Violation Log"
          subtitle="Blocked unsafe sales, tampering, overdue recalls and unknown products, recorded automatically."
          icon={<FileWarning size={22} />}
          actions={
            <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Violation type" className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800">
              <option value="">All types</option>
              {Object.entries(TYPES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          }
        />

        {error && <ErrorState message={error} onRetry={load} />}
        {!items && !error && <LoadingGrid cards={0} />}

        {items && (
          <div className="card overflow-hidden">
            {items.length === 0 ? (
              <div className="p-6">
                <EmptyState title="No violations recorded" message="That's good news." icon={<FileWarning size={26} />} />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-3">When</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Severity</th>
                        <th className="px-4 py-3">Batch</th>
                        <th className="px-4 py-3">Organisation</th>
                        <th className="px-6 py-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginate(items, page, 15).map((v) => (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3 whitespace-nowrap text-slate-600">{new Date(v.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3 font-medium text-slate-900">{TYPES[v.type] ?? v.type}</td>
                          <td className="px-4 py-3">
                            <RiskBadge value={v.severity} />
                          </td>
                          <td className="px-4 py-3 text-slate-700">{v.batch ? `${v.batch.batchNumber}` : '—'}</td>
                          <td className="px-4 py-3 text-slate-700">{v.user ? v.user.organizationName ?? v.user.fullName : '—'}</td>
                          <td className="px-6 py-3 text-slate-600 max-w-md">{v.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} pageSize={15} total={items.length} onChange={setPage} />
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
