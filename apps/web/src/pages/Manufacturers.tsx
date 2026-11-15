import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Factory, Plus, Pencil, Trash2, X } from 'lucide-react';

import DashboardLayout from '../components/layout/DashboardLayout';
import PageHeader from '../components/ui/PageHeader';
import Pagination, { paginate } from '../components/ui/Pagination';
import { EmptyState, ErrorState, LoadingGrid } from '../components/ui/States';
import { errorMessage, manufacturerService, type Manufacturer } from '../services/extraServices';
import { isAdmin } from '../auth/roles';

const EMPTY = { name: '', licenseNumber: '', email: '', phone: '', address: '' };

export default function Manufacturers() {
  const [items, setItems] = useState<Manufacturer[] | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<typeof EMPTY | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const admin = isAdmin();

  const load = async () => {
    setError('');
    try {
      setItems(await manufacturerService.list());
    } catch (e) {
      setError(errorMessage(e, 'Could not load manufacturers'));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!form) return;
    if (!form.name.trim() || (!editingId && !form.licenseNumber.trim())) {
      toast.error('Name and license number are required');
      return;
    }
    setSaving(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== '')) as Partial<Manufacturer>;
      if (editingId) {
        delete payload.licenseNumber;
        await manufacturerService.update(editingId, payload);
        toast.success('Manufacturer updated');
      } else {
        await manufacturerService.create(payload);
        toast.success('Manufacturer added');
      }
      setForm(null);
      setEditingId(null);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (m: Manufacturer) => {
    if (!window.confirm(`Delete ${m.name}? This cannot be undone.`)) return;
    try {
      await manufacturerService.remove(m.id);
      toast.success('Manufacturer deleted');
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const filtered = (items ?? []).filter((m) =>
    `${m.name} ${m.licenseNumber} ${m.email ?? ''}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Manufacturers"
          subtitle="Licensed pharmaceutical manufacturers registered on the platform."
          icon={<Factory size={22} />}
          actions={
            admin && (
              <button
                onClick={() => {
                  setForm({ ...EMPTY });
                  setEditingId(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Plus size={16} /> Add manufacturer
              </button>
            )
          }
        />

        {error && <ErrorState message={error} onRetry={load} />}
        {!items && !error && <LoadingGrid cards={0} />}

        {items && (
          <div className="card overflow-hidden">
            <div className="p-4 sm:p-6 pb-4">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, license or email"
                className="w-full sm:w-80 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-teal-600"
              />
            </div>
            {filtered.length === 0 ? (
              <div className="px-6 pb-6">
                <EmptyState title="No manufacturers found" icon={<Factory size={26} />} />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-6 py-3">Manufacturer</th>
                        <th className="px-4 py-3">License</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Batches</th>
                        <th className="px-4 py-3">Users</th>
                        {admin && <th className="px-6 py-3 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {paginate(filtered, page, 10).map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3">
                            <p className="font-medium text-slate-900">{m.name}</p>
                            <p className="text-xs text-slate-500">{m.address || '—'}</p>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-700">{m.licenseNumber}</td>
                          <td className="px-4 py-3 text-slate-700">
                            {m.email || '—'}
                            <span className="block text-xs text-slate-500">{m.phone}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{m._count?.batches ?? 0}</td>
                          <td className="px-4 py-3 text-slate-700">{m._count?.users ?? 0}</td>
                          {admin && (
                            <td className="px-6 py-3">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingId(m.id);
                                    setForm({ name: m.name, licenseNumber: m.licenseNumber, email: m.email ?? '', phone: m.phone ?? '', address: m.address ?? '' });
                                  }}
                                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                                  aria-label={`Edit ${m.name}`}
                                >
                                  <Pencil size={16} />
                                </button>
                                <button onClick={() => remove(m)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${m.name}`}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          )}
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

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{editingId ? 'Edit manufacturer' : 'Add manufacturer'}</h2>
              <button onClick={() => setForm(null)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 grid gap-4">
              {(
                [
                  ['name', 'Name *'],
                  ['licenseNumber', 'License number *'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['address', 'Address'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <input
                    value={form[key]}
                    disabled={key === 'licenseNumber' && !!editingId}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 outline-none focus:border-teal-600 disabled:opacity-60"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setForm(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={save} disabled={saving} className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
