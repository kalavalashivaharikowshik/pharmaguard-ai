import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bot, CheckCircle2, ClipboardCheck, Plus, X } from 'lucide-react';

import RiskBadge from '../ui/RiskBadge';
import { aiService, type RecallTask } from '../../services/aiService';
import { errorMessage } from '../../services/extraServices';
import { api } from '../../services/api';
import { isOversight } from '../../auth/roles';

/**
 * Recall actions on the Recalls page:
 * - every role: "My recall tasks" created by the AI agents, with a Complete button
 * - Regulator / Super Admin: initiate a new recall (the AI agents take it from there)
 */
export default function RecallAIPanel({ onChanged }: { onChanged(): void }) {
  const [tasks, setTasks] = useState<RecallTask[]>([]);
  const [creating, setCreating] = useState(false);
  const [batches, setBatches] = useState<{ id: string; batchNumber: string; drugName: string; status: string }[]>([]);
  const [form, setForm] = useState({ batchId: '', reason: '', severity: 'HIGH' });
  const [busy, setBusy] = useState(false);
  const oversight = isOversight();

  const loadTasks = () =>
    aiService
      .myTasks()
      .then(setTasks)
      .catch(() => undefined);

  useEffect(() => {
    loadTasks();
  }, []);

  const openCreate = async () => {
    setCreating(true);
    try {
      const res = await api.get('/batches');
      setBatches(res.data.filter((b: { status: string }) => b.status === 'ACTIVE' || b.status === 'TRANSFERRED'));
    } catch {
      setBatches([]);
    }
  };

  const create = async () => {
    if (!form.batchId || form.reason.trim().length < 5) {
      toast.error('Choose a batch and give a reason (at least 5 characters).');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post('/recalls', form);
      toast.success(`Recall ${res.data.recallNumber} created. AI agents are notifying every holder.`);
      setCreating(false);
      setForm({ batchId: '', reason: '', severity: 'HIGH' });
      setTimeout(onChanged, 1500);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const complete = async (task: RecallTask) => {
    const notes = window.prompt('Optional note (e.g. "All units quarantined in store room B")') ?? undefined;
    try {
      const res = await aiService.completeTask(task.id, notes || undefined);
      toast.success(res.recallCompleted ? 'Task completed. All holders done: recall closed and batch revoked.' : 'Recall task completed.');
      loadTasks();
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const open = tasks.filter((t) => t.status !== 'COMPLETED');

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="card p-6 lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <ClipboardCheck size={18} className="text-teal-600" /> My recall tasks
          </h2>
          <span className="text-sm text-slate-500">{open.length} open</span>
        </div>
        {open.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <CheckCircle2 size={16} className="text-emerald-600" /> No open recall tasks for your organisation.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {open.map((t) => (
              <li key={t.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {t.recall?.batch.drugName} · {t.recall?.batch.batchNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    Recall {t.recall?.recallNumber} · due {t.dueDate ? new Date(t.dueDate).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RiskBadge value={t.status} />
                  <button onClick={() => complete(t)} className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700">
                    Mark quarantined
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Bot size={18} className="text-emerald-600" /> AI recall agents
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          When a recall starts, the agents locate every unit, create a task per holder with a deadline, notify them, write a summary and escalate
          anything overdue. The batch is revoked on the blockchain once every holder has finished.
        </p>
        {oversight && (
          <button onClick={openCreate} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
            <Plus size={16} /> Initiate recall
          </button>
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-lg p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Initiate recall</h2>
              <button onClick={() => setCreating(false)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <label className="mt-5 block">
              <span className="text-sm font-medium text-slate-700">Batch</span>
              <select
                value={form.batchId}
                onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800"
              >
                <option value="">Select a batch</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.batchNumber} · {b.drugName}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Severity</span>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800"
              >
                <option value="CRITICAL">Critical (24h deadline)</option>
                <option value="HIGH">High (48h)</option>
                <option value="MEDIUM">Medium (72h)</option>
                <option value="LOW">Low (7 days)</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Reason</span>
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={3}
                placeholder="e.g. Contamination found during quality testing"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 outline-none focus:border-teal-600"
              />
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setCreating(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                Cancel
              </button>
              <button onClick={create} disabled={busy} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
                {busy ? 'Starting…' : 'Start recall'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
