import { ChevronLeft, ChevronRight } from 'lucide-react';

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  return items.slice((page - 1) * pageSize, page * pageSize);
}

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange(page: number): void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm">
      <span className="text-slate-500">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-slate-600">
          {page} / {pages}
        </span>
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
          className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
