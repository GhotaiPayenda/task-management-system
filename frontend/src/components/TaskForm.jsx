import { useEffect, useState } from 'react';
import { AlertCircle, CalendarClock, FolderOpen, Flag, ListChecks, Type } from 'lucide-react';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { defaultDeadlineInput, toDateTimeInput } from '../utils/format';
import { Spinner } from './Loader';

export default function TaskForm({ task, categories, onSubmit, onCancel, submitting, error }) {
  const [values, setValues] = useState({
    title: task?.title || '',
    description: task?.description || '',
    categoryId: task?.category_id ? String(task.category_id) : '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Pending',
    deadline: task ? toDateTimeInput(task.deadline) : defaultDeadlineInput(),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({
      title: task?.title || '',
      description: task?.description || '',
      categoryId: task?.category_id ? String(task.category_id) : '',
      priority: task?.priority || 'Medium',
      status: task?.status || 'Pending',
      deadline: task ? toDateTimeInput(task.deadline) : defaultDeadlineInput(),
    });
  }, [task]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (values.title.trim().length < 3) nextErrors.title = 'Title must be at least 3 characters.';
    if (values.title.trim().length > 150) nextErrors.title = 'Title must be 150 characters or fewer.';
    if (values.description.length > 5000) nextErrors.description = 'Description is too long.';
    if (!values.deadline) nextErrors.deadline = 'A deadline is required.';
    else if (Number.isNaN(new Date(values.deadline).getTime())) nextErrors.deadline = 'Enter a valid deadline.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      priority: values.priority,
      status: values.status,
      deadline: values.deadline,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="task-title" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Type className="h-3.5 w-3.5 text-slate-400" /> Task title <span className="text-rose-500">*</span>
        </label>
        <input
          id="task-title"
          value={values.title}
          onChange={(event) => setField('title', event.target.value)}
          placeholder="e.g. Prepare Q4 performance report"
          maxLength={150}
          className="input-base"
          autoFocus
        />
        {errors.title && <p className="mt-1 text-xs font-medium text-rose-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="task-description" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <ListChecks className="h-3.5 w-3.5 text-slate-400" /> Description
        </label>
        <textarea
          id="task-description"
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
          rows={4}
          maxLength={5000}
          placeholder="Add context, acceptance criteria, or notes…"
          className="input-base resize-y"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{errors.description || 'Optional, up to 5,000 characters.'}</span>
          <span>{values.description.length}/5000</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="task-category" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <FolderOpen className="h-3.5 w-3.5 text-slate-400" /> Category
          </label>
          <select id="task-category" value={values.categoryId} onChange={(event) => setField('categoryId', event.target.value)} className="input-base">
            <option value="">Uncategorized</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-priority" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Flag className="h-3.5 w-3.5 text-slate-400" /> Priority <span className="text-rose-500">*</span>
          </label>
          <select id="task-priority" value={values.priority} onChange={(event) => setField('priority', event.target.value)} className="input-base">
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-status" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ListChecks className="h-3.5 w-3.5 text-slate-400" /> Status <span className="text-rose-500">*</span>
          </label>
          <select id="task-status" value={values.status} onChange={(event) => setField('status', event.target.value)} className="input-base">
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="task-deadline" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <CalendarClock className="h-3.5 w-3.5 text-slate-400" /> Deadline <span className="text-rose-500">*</span>
          </label>
          <input
            id="task-deadline"
            type="datetime-local"
            value={values.deadline}
            onChange={(event) => setField('deadline', event.target.value)}
            className="input-base"
          />
          {errors.deadline && <p className="mt-1 text-xs font-medium text-rose-600">{errors.deadline}</p>}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {task ? 'Save changes' : 'Create task'}
        </button>
      </div>
    </form>
  );
}
