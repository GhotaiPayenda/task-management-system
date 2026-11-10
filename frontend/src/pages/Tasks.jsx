import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  FilterX,
  FolderOpen,
  ListTodo,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Tag,
  Trash2,
} from 'lucide-react';
import categoryService from '../services/categoryService';
import taskService from '../services/taskService';
import { getErrorMessage } from '../services/api';
import { useToast } from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import { DEADLINE_OPTIONS, PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_OPTIONS } from '../utils/constants';
import { formatDateTime, isOverdue } from '../utils/format';
import TaskTable from '../components/TaskTable';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { PriorityBadge, StatusBadge } from '../components/Badge';

const DEFAULT_FILTERS = {
  search: '',
  status: '',
  priority: '',
  categoryId: '',
  deadline: '',
  sort: 'newest',
};

const PAGE_SIZE = 8;

function FilterSelect({ label, value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="input-base py-2.5 text-xs">
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export default function Tasks() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [modal, setModal] = useState({ open: false, task: null });
  const [viewTask, setViewTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 350);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  useEffect(() => {
    categoryService
      .list()
      .then(setCategories)
      .catch((loadError) => toast.error(getErrorMessage(loadError, 'Could not load categories.')));
  }, [toast]);

  useEffect(() => {
    const params = new URLSearchParams(queryString);
    const search = params.get('search');
    const deadline = params.get('deadline');
    const taskId = params.get('task');
    const shouldOpenNew = params.get('new') === '1';

    if (search !== null || deadline !== null) {
      setFilters((current) => ({
        ...current,
        ...(search !== null ? { search } : {}),
        ...(deadline !== null ? { deadline } : {}),
      }));
      setPage(1);
    }

    if (shouldOpenNew) {
      setModal({ open: true, task: null });
      params.delete('new');
      setSearchParams(params, { replace: true });
    }

    if (taskId) {
      taskService
        .get(taskId)
        .then((task) => setViewTask(task))
        .catch((loadError) => toast.error(getErrorMessage(loadError, 'Could not open that task.')));
      params.delete('task');
      setSearchParams(params, { replace: true });
    }
  }, [queryString, setSearchParams, toast]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await taskService.list({
        search: debouncedSearch,
        status: filters.status,
        priority: filters.priority,
        categoryId: filters.categoryId,
        deadline: filters.deadline,
        sort: filters.sort,
        page,
        limit: PAGE_SIZE,
      });
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load tasks.'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.priority, filters.categoryId, filters.deadline, filters.sort, page, refreshKey]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    if (searchParams.has('search') || searchParams.has('deadline')) {
      const params = new URLSearchParams(searchParams);
      params.delete('search');
      params.delete('deadline');
      setSearchParams(params, { replace: true });
    }
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.status) count += 1;
    if (filters.priority) count += 1;
    if (filters.categoryId) count += 1;
    if (filters.deadline) count += 1;
    if (filters.sort !== 'newest') count += 1;
    return count;
  }, [filters]);

  const handleStatusChange = async (task, status) => {
    if (status === task.status) return;
    setUpdatingStatusId(task.id);
    try {
      const data = await taskService.updateStatus(task.id, status);
      setTasks((current) => current.map((item) => (item.id === task.id ? data.task : item)));
      toast.success(`"${task.title}" marked as ${status}.`);
    } catch (updateError) {
      toast.error(getErrorMessage(updateError, 'Could not update the task status.'));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.remove(deleteTarget.id);
      toast.success('Task deleted successfully.');
      setDeleteTarget(null);
      if (tasks.length === 1 && page > 1) setPage(page - 1);
      else refresh();
    } catch (deleteError) {
      toast.error(getErrorMessage(deleteError, 'Could not delete the task.'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = () => {
    if (!modal.task) setPage(1);
    refresh();
  };

  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Task management</p>
          <div className="mt-1 flex items-center gap-2.5">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900">All tasks</h2>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
              {pagination.total}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Search, filter, and manage every piece of work in one place.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={refresh} className="btn-secondary h-10" disabled={loading} aria-label="Refresh tasks">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button type="button" onClick={() => setModal({ open: true, task: null })} className="btn-primary h-10">
            <Plus className="h-4 w-4" /> Create task
          </button>
        </div>
      </div>

      <section className="card p-4">
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={filters.search}
                onChange={(event) => updateFilter('search', event.target.value)}
                placeholder="Search tasks by title…"
                aria-label="Search tasks by title"
                className="input-base py-2.5 pl-10 text-xs"
              />
            </div>
            <FilterSelect label="Filter by status" value={filters.status} onChange={(value) => updateFilter('status', value)} options={STATUS_OPTIONS} placeholder="All statuses" />
            <FilterSelect label="Filter by priority" value={filters.priority} onChange={(value) => updateFilter('priority', value)} options={PRIORITY_OPTIONS} placeholder="All priorities" />
            <select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)} aria-label="Filter by category" className="input-base py-2.5 text-xs">
              <option value="">All categories</option>
              <option value="uncategorized">Uncategorized</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <select value={filters.deadline} onChange={(event) => updateFilter('deadline', event.target.value)} aria-label="Filter by deadline" className="input-base py-2.5 text-xs">
              {DEADLINE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400">Sort</span>
              <select value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} aria-label="Sort tasks" className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none focus:border-indigo-400">
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600">{activeFilterCount} active</span>
              )}
            </div>
            <button type="button" onClick={clearFilters} disabled={activeFilterCount === 0} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">
              <FilterX className="h-3.5 w-3.5" /> Clear filters
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button type="button" onClick={refresh} className="self-start rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 sm:self-auto">Try again</button>
        </div>
      )}

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800">Task list</h3>
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />}
          </div>
          <p className="text-[11px] text-slate-400">
            {pagination.total === 0 ? 'No tasks' : `Showing ${start}–${end} of ${pagination.total} tasks`}
          </p>
        </div>

        {loading && tasks.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-center gap-4">
                <div className="h-10 flex-1 rounded-lg bg-slate-100" />
                <div className="hidden h-6 w-20 rounded-full bg-slate-100 sm:block" />
                <div className="hidden h-6 w-24 rounded-full bg-slate-100 sm:block" />
                <div className="h-8 w-24 rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          activeFilterCount > 0 ? (
            <EmptyState
              icon={SearchX}
              title="No tasks match your filters"
              description="Try changing your search or clearing the active filters."
              action={<button type="button" onClick={clearFilters} className="btn-secondary"><FilterX className="h-4 w-4" />Clear filters</button>}
            />
          ) : (
            <EmptyState
              icon={CirclePlus}
              title="Create your first task"
              description="Add a task with a deadline, priority, and category to get started."
              action={<button type="button" onClick={() => setModal({ open: true, task: null })} className="btn-primary"><Plus className="h-4 w-4" />Create task</button>}
            />
          )
        ) : (
          <>
            <TaskTable
              tasks={tasks}
              onView={setViewTask}
              onEdit={(task) => setModal({ open: true, task })}
              onDelete={setDeleteTarget}
              onStatusChange={handleStatusChange}
              updatingStatusId={updatingStatusId}
            />
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:px-5">
              <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex items-center gap-1.5">
                <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={pagination.page <= 1 || loading} className="btn-secondary h-8 px-2.5 text-xs">
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </button>
                <button type="button" onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} disabled={pagination.page >= pagination.totalPages || loading} className="btn-secondary h-8 px-2.5 text-xs">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <TaskModal
        open={modal.open}
        task={modal.task}
        categories={categories}
        onClose={() => setModal({ open: false, task: null })}
        onSaved={handleSaved}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        onConfirm={handleDelete}
        title="Delete task"
        confirmLabel="Delete task"
        loading={deleting}
        description={deleteTarget ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.` : ''}
      />

      <Modal
        open={Boolean(viewTask)}
        onClose={() => setViewTask(null)}
        title={viewTask?.title || 'Task details'}
        subtitle={viewTask ? `Task #${viewTask.id}` : ''}
        size="lg"
        footer={
          viewTask && (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => { const task = viewTask; setViewTask(null); setDeleteTarget(task); }} className="btn-secondary text-rose-600 hover:border-rose-200 hover:bg-rose-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <button type="button" onClick={() => setViewTask(null)} className="btn-secondary">Close</button>
                <button type="button" onClick={() => { const task = viewTask; setViewTask(null); setModal({ open: true, task }); }} className="btn-primary">
                  <Pencil className="h-4 w-4" /> Edit task
                </button>
              </div>
            </div>
          )
        }
      >
        {viewTask && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={viewTask.status} />
              <PriorityBadge priority={viewTask.priority} />
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                <Tag className="h-3 w-3" /> {viewTask.category_name || 'Uncategorized'}
              </span>
            </div>

            {isOverdue(viewTask.deadline, viewTask.status) && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                <AlertCircle className="h-4 w-4" /> This task is past its deadline.
              </div>
            )}

            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Description</h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                {viewTask.description || 'No description was provided for this task.'}
              </p>
            </div>

            <div className="grid gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">
              <Detail icon={CalendarClock} label="Deadline" value={formatDateTime(viewTask.deadline)} danger={isOverdue(viewTask.deadline, viewTask.status)} />
              <Detail icon={FolderOpen} label="Category" value={viewTask.category_name || 'Uncategorized'} />
              <Detail icon={CalendarDays} label="Created" value={formatDateTime(viewTask.created_at)} />
              <Detail icon={RefreshCw} label="Last updated" value={formatDateTime(viewTask.updated_at)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Detail({ icon: Icon, label, value, danger = false }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${danger ? 'text-rose-500' : 'text-slate-400'}`} />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className={`mt-0.5 text-sm font-medium ${danger ? 'text-rose-600' : 'text-slate-700'}`}>{value}</p>
      </div>
    </div>
  );
}
