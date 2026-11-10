export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const normalized = String(value).replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = parseDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return '—';
  return `${formatDate(date)} · ${new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)}`;
}

export function toDateTimeInput(value) {
  const date = parseDate(value);
  if (!date) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultDeadlineInput() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(17, 0, 0, 0);
  return toDateTimeInput(date);
}

export function isOverdue(deadline, status) {
  const date = parseDate(deadline);
  return Boolean(date && status !== 'Completed' && date.getTime() < Date.now());
}

export function deadlineLabel(value, status) {
  const date = parseDate(value);
  if (!date) return 'No deadline';
  if (status === 'Completed') return formatDate(date);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTarget = new Date(date);
  startOfTarget.setHours(0, 0, 0, 0);
  const diffDays = Math.round((startOfTarget - startOfToday) / 86400000);

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays === -1) return '1 day overdue';
  if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 7) return `Due in ${diffDays} days`;
  return formatDate(date);
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || 'A';
}
