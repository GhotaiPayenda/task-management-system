import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListChecks,
  RefreshCw,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import dashboardService from '../services/dashboardService';
import { getErrorMessage } from '../services/api';
import { PRIORITY_STYLES } from '../utils/constants';
import { deadlineLabel, formatDate, parseDate } from '../utils/format';
import StatCard from '../components/StatCard';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import {
  Spinner,
} from '../components/Loader';
import EmptyState from '../components/EmptyState';

const STATUS_HEX = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Completed: '#10b981' };

function buildDonut(data, total) {
  if (!total) return '#e2e8f0';
  let cursor = 0;
  const stops = data.map((item) => {
    const start = cursor;
    cursor += (item.count / total) * 100;
    return `${STATUS_HEX[item.status]} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${stops.join(', ')})`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function PanelSkeleton({ lines = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { admin } = useAuth();
  const [data, setData] = useState(null);
  const [recent, setRecent] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const [statsData, recentTasks, upcomingTasks] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentTasks(5),
        dashboardService.getUpcomingTasks(5),
      ]);
      setData(statsData);
      setRecent(recentTasks);
      setUpcoming(upcomingTasks);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Could not load dashboard data.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const stats = data?.stats;
  const statusOverview = data?.statusOverview || [];
  const priorityOverview = data?.priorityOverview || [];
  const totalForDonut = statusOverview.reduce((sum, item) => sum + item.count, 0);
  const totalPriority = priorityOverview.reduce((sum, item) => sum + item.count, 0);
  const displayName = admin?.name || 'Admin';
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">{today}</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
            {greeting()}, {displayName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">Here is what is happening across your tasks today.</p>
        </div>
        <button type="button" onClick={() => load(false)} className="btn-secondary h-10 self-start sm:self-auto" disabled={loading || refreshing}>
          {refreshing ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</span>
          <button type="button" onClick={() => load(true)} className="self-start rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 sm:self-auto">
            Try again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total tasks" value={loading ? '—' : stats?.total ?? 0} icon={ListChecks} tone="indigo" hint="All work items" loading={loading} />
        <StatCard title="Pending" value={loading ? '—' : stats?.pending ?? 0} icon={Clock3} tone="amber" hint="Awaiting action" loading={loading} />
        <StatCard title="In progress" value={loading ? '—' : stats?.inProgress ?? 0} icon={Timer} tone="blue" hint="Actively moving" loading={loading} />
        <StatCard title="Completed" value={loading ? '—' : stats?.completed ?? 0} icon={CheckCircle2} tone="emerald" hint="Done and dusted" loading={loading} />
        <StatCard title="Overdue" value={loading ? '—' : stats?.overdue ?? 0} icon={AlertTriangle} tone="rose" hint="Past the deadline" loading={loading} />
        <StatCard
          title="Completion rate"
          value={loading ? '—' : `${stats?.completionPercentage ?? 0}%`}
          icon={TrendingUp}
          tone="violet"
          hint="Of all tasks completed"
          progress={loading ? 0 : stats?.completionPercentage ?? 0}
          loading={loading}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="card p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">Status overview</h3>
              <p className="mt-0.5 text-xs text-slate-500">Distribution across every task</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {totalForDonut} total
            </span>
          </div>
          {loading ? (
            <div className="flex items-center gap-5">
              <div className="h-28 w-28 animate-pulse rounded-full bg-slate-100" />
              <div className="flex-1 space-y-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-3 animate-pulse rounded bg-slate-100" />)}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: buildDonut(statusOverview, totalForDonut) }}>
                <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="font-display text-xl font-bold text-slate-900">{stats?.completionPercentage ?? 0}%</span>
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">complete</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2.5">
                {statusOverview.map((item) => (
                  <div key={item.status} className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-600">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: STATUS_HEX[item.status] }} />
                      <span className="truncate">{item.status}</span>
                    </span>
                    <span className="text-xs font-bold text-slate-800">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="card p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">Priority overview</h3>
              <p className="mt-0.5 text-xs text-slate-500">How urgent the workload is</p>
            </div>
            <FlagBadge total={totalPriority} loading={loading} />
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-7 animate-pulse rounded bg-slate-100" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {priorityOverview.map((item) => {
                const percent = totalPriority ? Math.round((item.count / totalPriority) * 100) : 0;
                return (
                  <div key={item.priority}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-600">
                        <span className={`h-2 w-2 rounded-full ${PRIORITY_STYLES[item.priority]?.dot || 'bg-slate-400'}`} />
                        {item.priority}
                      </span>
                      <span className="font-semibold text-slate-500">{item.count} <span className="font-normal text-slate-400">({percent}%)</span></span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${PRIORITY_STYLES[item.priority]?.bar || 'bg-slate-400'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="card flex flex-col p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-display text-sm font-bold text-slate-900">Upcoming deadlines</h3>
              <p className="mt-0.5 text-xs text-slate-500">Next tasks that need attention</p>
            </div>
            <CalendarClock className="h-4 w-4 text-slate-400" />
          </div>
          {loading ? (
            <PanelSkeleton lines={4} />
          ) : upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming deadlines" description="You are all clear for now." className="flex-1 py-6" />
          ) : (
            <div className="flex-1 space-y-2">
              {upcoming.map((task) => {
                const date = parseDate(task.deadline);
                return (
                  <Link
                    key={task.id}
                    to={`/tasks?task=${task.id}`}
                    className="group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-slate-100 hover:bg-slate-50"
                  >
                    <span className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                      <span className="text-[9px] font-bold uppercase leading-none">{date ? new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date) : '—'}</span>
                      <span className="text-sm font-bold leading-tight">{date ? date.getDate() : '—'}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-800 group-hover:text-indigo-600">{task.title}</span>
                      <span className="block truncate text-[10px] text-slate-400">
                        {deadlineLabel(task.deadline, task.status)} · {task.category_name || 'Uncategorized'}
                      </span>
                    </span>
                    <PriorityBadge priority={task.priority} />
                  </Link>
                );
              })}
            </div>
          )}
          <Link to="/tasks?deadline=week" className="mt-4 inline-flex items-center gap-1 border-t border-slate-100 pt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View all upcoming <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">Recent tasks</h3>
            <p className="mt-0.5 text-xs text-slate-500">The latest work added to your workspace</p>
          </div>
          <Link to="/tasks" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-5"><PanelSkeleton lines={5} /></div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No tasks yet"
            description="Create your first task to see it appear here."
            action={<Link to="/tasks?new=1" className="btn-primary">Create task</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-2.5">Task</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Priority</th>
                  <th className="px-4 py-2.5">Deadline</th>
                  <th className="px-5 py-2.5 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recent.map((task) => (
                  <tr key={task.id} className="group transition hover:bg-slate-50/70">
                    <td className="max-w-[300px] px-5 py-3.5">
                      <p className="truncate text-sm font-semibold text-slate-800">{task.title}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">{task.category_name || 'Uncategorized'}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={task.status} /></td>
                    <td className="px-4 py-3.5"><PriorityBadge priority={task.priority} /></td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{formatDate(task.deadline)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to={`/tasks?task=${task.id}`} className="icon-btn" aria-label={`Open ${task.title}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FlagBadge({ total, loading }) {
  return (
    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
      {loading ? '—' : `${total} total`}
    </span>
  );
}
