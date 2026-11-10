export const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

export const PRIORITY_OPTIONS = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'deadline_asc', label: 'Deadline: soonest' },
  { value: 'deadline_desc', label: 'Deadline: latest' },
  { value: 'priority', label: 'Priority: highest' },
  { value: 'title_asc', label: 'Title: A–Z' },
];

export const DEADLINE_OPTIONS = [
  { value: '', label: 'Any deadline' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'today', label: 'Due today' },
  { value: 'week', label: 'Next 7 days' },
  { value: 'month', label: 'This month' },
];

export const STATUS_STYLES = {
  Pending: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dot: 'bg-amber-500',
    bar: 'bg-amber-400',
    text: 'text-amber-600',
  },
  'In Progress': {
    badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    dot: 'bg-blue-500',
    bar: 'bg-blue-500',
    text: 'text-blue-600',
  },
  Completed: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600',
  },
};

export const PRIORITY_STYLES = {
  Low: { badge: 'bg-slate-50 text-slate-600 ring-slate-500/20', bar: 'bg-slate-400', dot: 'bg-slate-400' },
  Medium: { badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', bar: 'bg-indigo-400', dot: 'bg-indigo-400' },
  High: { badge: 'bg-orange-50 text-orange-700 ring-orange-600/20', bar: 'bg-orange-400', dot: 'bg-orange-400' },
  Urgent: { badge: 'bg-rose-50 text-rose-700 ring-rose-600/20', bar: 'bg-rose-500', dot: 'bg-rose-500' },
};
