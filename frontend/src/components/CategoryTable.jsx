import { CalendarDays, Pencil, Tags, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/format';

function CategoryAvatar({ name }) {
  const palettes = [
    'from-indigo-500 to-violet-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];
  const index = (name?.charCodeAt(0) || 0) % palettes.length;
  return (
    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${palettes[index]} text-xs font-bold text-white shadow-sm`}>
      {name?.[0]?.toUpperCase() || 'C'}
    </span>
  );
}

export default function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Category</th>
              <th className="px-4 py-3.5">Description</th>
              <th className="px-4 py-3.5">Tasks</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((category) => (
              <tr key={category.id} className="group bg-white transition hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <CategoryAvatar name={category.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">{category.name}</p>
                      <p className="text-[11px] text-slate-400">Category #{category.id}</p>
                    </div>
                  </div>
                </td>
                <td className="max-w-[360px] px-4 py-4">
                  <p className="truncate text-sm text-slate-500">{category.description || 'No description'}</p>
                </td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${Number(category.task_count) > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Tags className="h-3 w-3" />
                    {Number(category.task_count)} {Number(category.task_count) === 1 ? 'task' : 'tasks'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{formatDate(category.created_at)}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => onEdit(category)} className="icon-btn hover:bg-indigo-50 hover:text-indigo-600" title="Edit category" aria-label={`Edit ${category.name}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => onDelete(category)} className="icon-btn hover:bg-rose-50 hover:text-rose-600" title="Delete category" aria-label={`Delete ${category.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {categories.map((category) => (
          <div key={category.id} className="bg-white p-4">
            <div className="flex items-start gap-3">
              <CategoryAvatar name={category.name} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-slate-800">{category.name}</h3>
                <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{category.description || 'No description'}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
                    {Number(category.task_count)} {Number(category.task_count) === 1 ? 'task' : 'tasks'}
                  </span>
                  <span>{formatDate(category.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => onEdit(category)} className="icon-btn hover:bg-indigo-50 hover:text-indigo-600" aria-label={`Edit ${category.name}`}>
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => onDelete(category)} className="icon-btn hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${category.name}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
