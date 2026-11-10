import { AlertCircle, CalendarDays, Eye, Pencil, Trash2 } from 'lucide-react';
import { STATUS_OPTIONS, STATUS_STYLES } from '../utils/constants';
import { formatDate, formatDateTime, isOverdue } from '../utils/format';
import { CategoryPill, PriorityBadge } from './Badge';

function StatusSelect({ task, onChange, updating }) {
  const style = STATUS_STYLES[task.status] || STATUS_STYLES.Pending;
  return (
    <select
      value={task.status}
      onChange={(event) => onChange(task, event.target.value)}
      disabled={updating}
      aria-label={`Update status for ${task.title}`}
      className={`max-w-[132px] cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-7 text-xs font-semibold ring-1 ring-inset outline-none transition disabled:opacity-60 ${style.badge}`}
      style={{ appearance: 'auto' }}
    >
      {STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function DeadlineCell({ task }) {
  const overdue = isOverdue(task.deadline, task.status);
  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${overdue ? 'text-rose-600' : 'text-slate-600'}`}>
      {overdue ? <AlertCircle className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5 text-slate-400" />}
      <span>{formatDateTime(task.deadline)}</span>
    </div>
  );
}

function RowActions({ task, onView, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={() => onView(task)} className="icon-btn" title="View task details" aria-label={`View ${task.title}`}>
        <Eye className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onEdit(task)} className="icon-btn hover:bg-indigo-50 hover:text-indigo-600" title="Edit task" aria-label={`Edit ${task.title}`}>
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onDelete(task)} className="icon-btn hover:bg-rose-50 hover:text-rose-600" title="Delete task" aria-label={`Delete ${task.title}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function TaskTable({ tasks, onView, onEdit, onDelete, onStatusChange, updatingStatusId }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3.5">Task</th>
              <th className="px-4 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Deadline</th>
              <th className="px-4 py-3.5">Created</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="group bg-white transition hover:bg-slate-50/70">
                <td className="max-w-[360px] px-5 py-4">
                  <button type="button" onClick={() => onView(task)} className="block max-w-full text-left">
                    <span className="block truncate text-sm font-semibold text-slate-800 transition group-hover:text-indigo-600">
                      {task.title}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <CategoryPill name={task.category_name} />
                      {task.description && <span className="truncate text-[11px] text-slate-400">{task.description}</span>}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-4"><PriorityBadge priority={task.priority} /></td>
                <td className="px-4 py-4">
                  <StatusSelect task={task} onChange={onStatusChange} updating={updatingStatusId === task.id} />
                </td>
                <td className="px-4 py-4"><DeadlineCell task={task} /></td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{formatDate(task.created_at)}</td>
                <td className="px-5 py-4">
                  <RowActions task={task} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 transition active:bg-slate-50">
            <div className="flex items-start justify-between gap-3">
              <button type="button" onClick={() => onView(task)} className="min-w-0 flex-1 text-left">
                <h3 className="truncate text-sm font-semibold text-slate-800">{task.title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <CategoryPill name={task.category_name} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </button>
              <RowActions task={task} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <DeadlineCell task={task} />
              <StatusSelect task={task} onChange={onStatusChange} updating={updatingStatusId === task.id} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
