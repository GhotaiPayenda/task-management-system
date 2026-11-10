import { useEffect, useState } from 'react';
import { AlertCircle, Tag, AlignLeft } from 'lucide-react';
import { Spinner } from './Loader';

export default function CategoryForm({ category, onSubmit, onCancel, submitting, error }) {
  const [values, setValues] = useState({ name: category?.name || '', description: category?.description || '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({ name: category?.name || '', description: category?.description || '' });
  }, [category]);

  const setField = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (values.name.trim().length < 2) nextErrors.name = 'Category name must be at least 2 characters.';
    if (values.name.trim().length > 80) nextErrors.name = 'Category name must be 80 characters or fewer.';
    if (values.description.length > 500) nextErrors.description = 'Description must be 500 characters or fewer.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit({ name: values.name.trim(), description: values.description.trim() });
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
        <label htmlFor="category-name" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Tag className="h-3.5 w-3.5 text-slate-400" /> Category name <span className="text-rose-500">*</span>
        </label>
        <input
          id="category-name"
          value={values.name}
          onChange={(event) => setField('name', event.target.value)}
          placeholder="e.g. Product Design"
          maxLength={80}
          className="input-base"
          autoFocus
        />
        {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
        <p className="mt-1 text-[11px] text-slate-400">Names must be unique.</p>
      </div>

      <div>
        <label htmlFor="category-description" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <AlignLeft className="h-3.5 w-3.5 text-slate-400" /> Description
        </label>
        <textarea
          id="category-description"
          value={values.description}
          onChange={(event) => setField('description', event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="What type of work belongs in this category?"
          className="input-base resize-y"
        />
        <div className="mt-1 flex justify-between text-[11px] text-slate-400">
          <span>{errors.description || 'Optional, up to 500 characters.'}</span>
          <span>{values.description.length}/500</span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting && <Spinner className="h-4 w-4" />}
          {category ? 'Save changes' : 'Create category'}
        </button>
      </div>
    </form>
  );
}
