import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';

import RiskBadge from '../ui/RiskBadge';
import { aiService, type RecallTask } from '../../services/aiService';
import { errorMessage } from '../../services/extraServices';
import { isOversight, isManufacturer } from '../../auth/roles';

/** Impact, progress and per-holder tasks for one recall (inside the recall drawer). */
export default function RecallAgentDetails({ recallId, status }: { recallId: string; status: string }) {
  const [impact, setImpact] = useState<any>(null);
  const [tasks, setTasks] = useState<RecallTask[]>([]);
  const canSeeTasks = isOversight() || isManufacturer();

  const load = () => {
    aiService.impact(recallId).then(setImpact).catch(() => undefined);
    if (canSeeTasks) aiService.recallTasks(recallId).then(setTasks).catch(() => undefined);
  };

  useEffect(load, [recallId]); // eslint-disable-line react-hooks/exhaustive-deps

  const rerun = async () => {
    try {
      const r = await aiService.runAgent(recallId);
      toast.success(`Agents ran: ${r.tasksCreated ?? 0} new task(s), ${r.notified ?? 0} notified.`);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const finalize = async () => {
    try {
      const r = await aiService.finalize(recallId);
      toast.success(r.message);
      load();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (!impact) return null;

  return (
    <div className="card p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900">Recall progress</h3>
        {isOversight() && status === 'ACTIVE' && (
          <div className="flex gap-2">
            <button onClick={rerun} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100">
              <RefreshCw size={14} /> Re-run agents
            </button>
            <button onClick={finalize} className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700">
              Finalize
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-2xl font-bold text-slate-900">{impact.affectedOrganizations}</p>
          <p className="text-xs text-slate-500">Organisations</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-2xl font-bold text-slate-900">{impact.affectedUnits}</p>
          <p className="text-xs text-slate-500">Units</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-2xl font-bold text-slate-900">{impact.tasks.overdue}</p>
          <p className="text-xs text-slate-500">Overdue</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>
            {impact.tasks.completed} of {impact.tasks.total} tasks completed
          </span>
          <span>{impact.progress}%</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-slate-200">
          <div className="h-2.5 rounded-full bg-emerald-600 transition-all" style={{ width: `${impact.progress}%` }} />
        </div>
        {impact.dueDate && <p className="mt-2 text-xs text-slate-500">Deadline {new Date(impact.dueDate).toLocaleString()}</p>}
      </div>

      {tasks.length > 0 && (
        <ul className="divide-y divide-slate-200">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{t.user?.organizationName ?? t.user?.fullName}</p>
                <p className="text-xs text-slate-500">
                  {t.user?.role?.toLowerCase()} {t.user?.city ? `· ${t.user.city}` : ''} {t.notes ? `· "${t.notes}"` : ''}
                </p>
              </div>
              <RiskBadge value={t.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
