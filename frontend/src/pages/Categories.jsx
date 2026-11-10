import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, FolderOpen, Plus, RefreshCw, Tags, ListTodo } from 'lucide-react';
import categoryService from '../services/categoryService';
import { getErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import CategoryTable from '../components/CategoryTable';
import CategoryModal from '../components/CategoryModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

export default function Categories() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteMode, setDeleteMode] = useState('none');
  const [reassignTo, setReassignTo] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await categoryService.list();
      setCategories(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load categories.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const otherCategories = useMemo(
    () => (deleteTarget ? categories.filter((category) => category.id !== deleteTarget.id) : []),
    [categories, deleteTarget]
  );

  const assignedTasks = useMemo(
    () => categories.reduce((sum, category) => sum + Number(category.task_count || 0), 0),
    [categories]
  );
  const emptyCategories = useMemo(
    () => categories.filter((category) => Number(category.task_count) === 0).length,
    [categories]
  );

  const openDelete = (category) => {
    const others = categories.filter((item) => item.id !== category.id);
    setDeleteTarget(category);
    setReassignTo(others[0] ? String(others[0].id) : '');
    setDeleteMode(Number(category.task_count) > 0 ? (others[0] ? 'reassign' : 'uncategorize') : 'none');
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
    setDeleteMode('none');
    setReassignTo('');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const taskCount = Number(deleteTarget.task_count);
      const options = {};
      if (taskCount > 0) {
        options.strategy = deleteMode;
        if (deleteMode === 'reassign') options.reassignTo = Number(reassignTo);
      }
      const data = await categoryService.remove(deleteTarget.id, options);
      toast.success(data.message || 'Category deleted successfully.');
      setDeleteTarget(null);
      setDeleteMode('none');
      setReassignTo('');
      setRefreshKey((key) => key + 1);
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'Could not delete the category.'));
      setRefreshKey((key) => key + 1);
    } finally {
      setDeleting(false);
    }
  };

  const confirmLabel = deleteTarget && Number(deleteTarget.task_count) > 0
    ? deleteMode === 'reassign' ? 'Delete & reassign' : 'Delete & uncategorize'
    : 'Delete category';

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Workspace structure</p>
          <div className="mt-1 flex items-center gap-2.5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">Categories</h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{categories.length}</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Organize tasks into clear, reusable groups.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="btn-secondary h-10" disabled={loading} aria-label="Refresh categories">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button type="button" onClick={() => setModal({ open: true, category: null })} className="btn-primary h-10">
            <Plus className="h-4 w-4" /> Create category
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard icon={Tags} label="Total categories" value={categories.length} tone="bg-indigo-50 text-indigo-600" loading={loading} />
        <SummaryCard icon={ListTodo} label="Assigned tasks" value={assignedTasks} tone="bg-blue-50 text-blue-600" loading={loading} />
        <SummaryCard icon={FolderOpen} label="Empty categories" value={emptyCategories} tone="bg-slate-100 text-slate-500" loading={loading} />
      </div>

      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button type="button" onClick={() => setRefreshKey((key) => key + 1)} className="self-start rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 sm:self-auto">Try again</button>
        </div>
      )}

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">All categories</h3>
          </div>
          <p className="text-[11px] text-slate-400">{categories.length} total</p>
        </div>

        {loading && categories.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-4">
                <div className="h-9 w-9 rounded-xl bg-slate-100" />
                <div className="h-4 flex-1 rounded bg-slate-100" />
                <div className="hidden h-6 w-24 rounded-full bg-slate-100 sm:block" />
                <div className="h-8 w-20 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories yet"
            description="Create categories like Design, Marketing, or Operations to organize your tasks."
            action={<button type="button" onClick={() => setModal({ open: true, category: null })} className="btn-primary"><Plus className="h-4 w-4" />Create category</button>}
          />
        ) : (
          <CategoryTable
            categories={categories}
            onEdit={(category) => setModal({ open: true, category })}
            onDelete={openDelete}
          />
        )}
      </section>

      <CategoryModal
        open={modal.open}
        category={modal.category}
        onClose={() => setModal({ open: false, category: null })}
        onSaved={() => {
          setRefreshKey((key) => key + 1);
          setModal({ open: false, category: null });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={closeDelete}
        onConfirm={handleDelete}
        title="Delete category"
        confirmLabel={confirmLabel}
        loading={deleting}
        confirmDisabled={Number(deleteTarget?.task_count) > 0 && deleteMode === 'reassign' && !reassignTo}
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-slate-600">
              Are you sure you want to delete <strong className="font-semibold text-slate-800">“{deleteTarget.name}”</strong>?
            </p>

            {Number(deleteTarget.task_count) > 0 ? (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                <p className="flex items-start gap-2 text-xs font-medium leading-5 text-amber-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  This category is assigned to {Number(deleteTarget.task_count)} task{Number(deleteTarget.task_count) === 1 ? '' : 's'}. Choose what should happen to them.
                </p>

                <label className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition ${deleteMode === 'reassign' ? 'border-indigo-300 bg-white ring-2 ring-indigo-500/10' : 'border-transparent bg-white/60 hover:bg-white'}`}>
                  <input
                    type="radio"
                    name="delete-mode"
                    value="reassign"
                    checked={deleteMode === 'reassign'}
                    onChange={() => setDeleteMode('reassign')}
                    disabled={otherCategories.length === 0}
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                  />
                  <span className="min-w-0 flex-1 text-xs">
                    <span className="block font-semibold text-slate-700">Move tasks to another category</span>
                    <select
                      value={reassignTo}
                      onChange={(event) => { setReassignTo(event.target.value); setDeleteMode('reassign'); }}
                      disabled={otherCategories.length === 0 || deleteMode !== 'reassign'}
                      className="input-base mt-2 py-1.5 text-xs disabled:opacity-60"
                    >
                      <option value="">Select a category…</option>
                      {otherCategories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {otherCategories.length === 0 && <span className="mt-1 block text-[10px] text-slate-400">No other categories are available.</span>}
                  </span>
                </label>

                <label className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 transition ${deleteMode === 'uncategorize' ? 'border-indigo-300 bg-white ring-2 ring-indigo-500/10' : 'border-transparent bg-white/60 hover:bg-white'}`}>
                  <input
                    type="radio"
                    name="delete-mode"
                    value="uncategorize"
                    checked={deleteMode === 'uncategorize'}
                    onChange={() => setDeleteMode('uncategorize')}
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-xs">
                    <span className="block font-semibold text-slate-700">Move tasks to Uncategorized</span>
                    <span className="block text-slate-500">Tasks stay in your workspace and can be reassigned later.</span>
                  </span>
                </label>
              </div>
            ) : (
              <p className="text-sm leading-6 text-slate-500">This category has no assigned tasks. This action cannot be undone.</p>
            )}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone, loading }) {
  return (
    <div className="card flex items-center gap-3.5 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-xl font-bold text-slate-900">{loading ? '—' : value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}
