const { pool } = require('../config/db');

const SELECT_TASK = `
  SELECT t.id, t.title, t.description, t.category_id, c.name AS category_name,
         t.priority, t.status, t.deadline, t.created_at, t.updated_at
  FROM tasks t
  LEFT JOIN categories c ON c.id = t.category_id
`;

const SORT_SQL = {
  newest: 't.created_at DESC, t.id DESC',
  oldest: 't.created_at ASC, t.id ASC',
  deadline_asc: 't.deadline ASC, t.id DESC',
  deadline_desc: 't.deadline DESC, t.id DESC',
  priority: "FIELD(t.priority, 'Urgent', 'High', 'Medium', 'Low'), t.deadline ASC",
  title_asc: 't.title ASC',
};

function buildWhere(filters) {
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push('t.title LIKE ?');
    params.push(`%${filters.search}%`);
  }
  if (filters.status) {
    clauses.push('t.status = ?');
    params.push(filters.status);
  }
  if (filters.priority) {
    clauses.push('t.priority = ?');
    params.push(filters.priority);
  }
  if (filters.categoryId === 'uncategorized') {
    clauses.push('t.category_id IS NULL');
  } else if (filters.categoryId) {
    clauses.push('t.category_id = ?');
    params.push(filters.categoryId);
  }
  if (filters.deadline === 'overdue') {
    clauses.push("t.deadline < NOW() AND t.status <> 'Completed'");
  } else if (filters.deadline === 'today') {
    clauses.push('DATE(t.deadline) = CURDATE()');
  } else if (filters.deadline === 'week') {
    clauses.push('t.deadline BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)');
  } else if (filters.deadline === 'month') {
    clauses.push('YEAR(t.deadline) = YEAR(CURDATE()) AND MONTH(t.deadline) = MONTH(CURDATE())');
  }
  if (filters.deadlineFrom) {
    clauses.push('t.deadline >= ?');
    params.push(filters.deadlineFrom);
  }
  if (filters.deadlineTo) {
    clauses.push('t.deadline <= ?');
    params.push(filters.deadlineTo);
  }

  return {
    where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

async function findAll(filters) {
  const { where, params } = buildWhere(filters);
  const orderBy = SORT_SQL[filters.sort] || SORT_SQL.newest;
  const offset = (filters.page - 1) * filters.limit;

  const [countRows] = await pool.execute(`SELECT COUNT(*) AS total FROM tasks t ${where}`, params);
  const total = Number(countRows[0].total);

  const [rows] = await pool.execute(
    `${SELECT_TASK} ${where} ORDER BY ${orderBy} LIMIT ${filters.limit} OFFSET ${offset}`,
    params
  );

  return {
    tasks: rows,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  };
}

async function findById(id) {
  const [rows] = await pool.execute(`${SELECT_TASK} WHERE t.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create(payload) {
  const [result] = await pool.execute(
    `INSERT INTO tasks (title, description, category_id, priority, status, deadline)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [payload.title, payload.description, payload.categoryId, payload.priority, payload.status, payload.deadline]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const map = {
    title: 'title',
    description: 'description',
    categoryId: 'category_id',
    priority: 'priority',
    status: 'status',
    deadline: 'deadline',
  };
  const sets = [];
  const params = [];
  Object.entries(map).forEach(([key, column]) => {
    if (fields[key] !== undefined) {
      sets.push(`${column} = ?`);
      params.push(fields[key]);
    }
  });
  if (sets.length === 0) return findById(id);
  params.push(id);
  await pool.execute(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, create, update, remove, SORT_SQL };
