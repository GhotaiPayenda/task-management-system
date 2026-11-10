const HttpError = require('./HttpError');

const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];
const SORT_OPTIONS = ['newest', 'oldest', 'deadline_asc', 'deadline_desc', 'priority', 'title_asc'];
const DEADLINE_FILTERS = ['overdue', 'today', 'week', 'month'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(errors) {
  throw new HttpError(400, 'Please check the submitted information.', errors);
}

function str(value, field, { required = false, min = 0, max = 255 } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new HttpError(400, 'Please check the submitted information.', [`${field} is required.`]);
    return null;
  }
  if (typeof value !== 'string') {
    throw new HttpError(400, 'Please check the submitted information.', [`${field} must be text.`]);
  }
  const clean = value.trim();
  if (required && clean.length === 0) {
    throw new HttpError(400, 'Please check the submitted information.', [`${field} is required.`]);
  }
  if (clean.length > 0 && clean.length < min) {
    throw new HttpError(400, 'Please check the submitted information.', [`${field} must be at least ${min} characters.`]);
  }
  if (clean.length > max) {
    throw new HttpError(400, 'Please check the submitted information.', [`${field} must be at most ${max} characters.`]);
  }
  return clean.length === 0 && !required ? null : clean;
}

function positiveId(value, field = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'Please check the submitted information.', [`${field} must be a valid positive number.`]);
  }
  return id;
}

function optionalId(value, field = 'categoryId') {
  if (value === undefined || value === null || value === '' || value === 'null') return null;
  return positiveId(value, field);
}

function enumValue(value, allowed, field, { required = true, fallback = null } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, 'Please check the submitted information.', [`${field} is required.`]);
    return fallback;
  }
  if (!allowed.includes(value)) {
    throw new HttpError(400, 'Please check the submitted information.', [
      `${field} must be one of: ${allowed.join(', ')}.`,
    ]);
  }
  return value;
}

function toMySqlDateTime(value, field = 'deadline', { required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw new HttpError(400, 'Please check the submitted information.', [`${field} is required.`]);
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'Please check the submitted information.', [`${field} must be a valid date and time.`]);
  }
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function validateLogin(body = {}) {
  const errors = [];
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email) errors.push('Email is required.');
  else if (!EMAIL_RE.test(email)) errors.push('Enter a valid email address.');
  if (!password) errors.push('Password is required.');
  else if (password.length < 6) errors.push('Password must be at least 6 characters.');
  if (errors.length) fail(errors);
  return { email, password };
}

function validateRegistration(body = {}) {
  const errors = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!name) errors.push('Name is required.');
  else if (name.length < 2) errors.push('Name must be at least 2 characters.');
  else if (name.length > 100) errors.push('Name must be at most 100 characters.');

  if (!email) errors.push('Email is required.');
  else if (!EMAIL_RE.test(email)) errors.push('Enter a valid email address.');
  else if (email.length > 255) errors.push('Email must be at most 255 characters.');

  if (!password) errors.push('Password is required.');
  else if (password.length < 8) errors.push('Password must be at least 8 characters.');
  else if (password.length > 72) errors.push('Password must be at most 72 characters.');

  if (confirmPassword && password !== confirmPassword) {
    errors.push('Passwords do not match.');
  }

  if (errors.length) fail(errors);
  return { name, email, password };
}

function validateTask(body = {}, { partial = false } = {}) {
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);
  const errors = [];
  const payload = {};

  try {
    if (!partial || has('title')) payload.title = str(body.title, 'Title', { required: true, min: 3, max: 150 });
    if (!partial || has('description')) payload.description = str(body.description, 'Description', { max: 5000 });
    if (!partial || has('categoryId') || has('category_id')) {
      payload.categoryId = optionalId(body.categoryId ?? body.category_id);
    }
    if (!partial || has('priority')) {
      payload.priority = enumValue(body.priority, PRIORITIES, 'Priority', { required: true });
    }
    if (!partial || has('status')) {
      payload.status = enumValue(body.status, STATUSES, 'Status', { required: true });
    }
    if (!partial || has('deadline')) {
      payload.deadline = toMySqlDateTime(body.deadline, 'Deadline', { required: true });
    }
  } catch (error) {
    if (error instanceof HttpError && Array.isArray(error.details)) errors.push(...error.details);
    else throw error;
  }

  if (errors.length) fail(errors);
  if (partial && Object.keys(payload).length === 0) {
    fail(['Provide at least one task field to update.']);
  }
  return payload;
}

function validateCategory(body = {}, { partial = false } = {}) {
  const has = (key) => Object.prototype.hasOwnProperty.call(body, key);
  const payload = {};
  const errors = [];

  try {
    if (!partial || has('name')) payload.name = str(body.name, 'Category name', { required: true, min: 2, max: 80 });
    if (!partial || has('description')) {
      payload.description = str(body.description, 'Description', { max: 500 });
    }
  } catch (error) {
    if (error instanceof HttpError && Array.isArray(error.details)) errors.push(...error.details);
    else throw error;
  }

  if (errors.length) fail(errors);
  if (partial && Object.keys(payload).length === 0) fail(['Provide at least one category field to update.']);
  return payload;
}

function parseTaskFilters(query = {}) {
  const filters = {
    search: typeof query.search === 'string' ? query.search.trim().slice(0, 150) : '',
    status: query.status ? enumValue(query.status, STATUSES, 'Status') : '',
    priority: query.priority ? enumValue(query.priority, PRIORITIES, 'Priority') : '',
    categoryId: null,
    deadline: query.deadline ? enumValue(query.deadline, DEADLINE_FILTERS, 'Deadline') : '',
    deadlineFrom: query.deadlineFrom ? toMySqlDateTime(String(query.deadlineFrom).slice(0, 10), 'Deadline from') : null,
    deadlineTo: query.deadlineTo ? toMySqlDateTime(String(query.deadlineTo).slice(0, 10) + ' 23:59:59', 'Deadline to') : null,
    sort: query.sort ? enumValue(query.sort, SORT_OPTIONS, 'Sort') : 'newest',
    page: Math.max(1, Number.parseInt(query.page, 10) || 1),
    limit: Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 10)),
  };

  if (query.categoryId !== undefined && query.categoryId !== '') {
    if (query.categoryId === 'uncategorized') filters.categoryId = 'uncategorized';
    else filters.categoryId = positiveId(query.categoryId, 'Category');
  }

  return filters;
}

module.exports = {
  PRIORITIES,
  STATUSES,
  SORT_OPTIONS,
  DEADLINE_FILTERS,
  EMAIL_RE,
  validateLogin,
  validateRegistration,
  validateTask,
  validateCategory,
  parseTaskFilters,
  positiveId,
  toMySqlDateTime,
};
