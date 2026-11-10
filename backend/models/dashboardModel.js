const { pool } = require('../config/db');

async function getStats() {
  const [rows] = await pool.execute(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(status = 'Pending'), 0) AS pending,
      COALESCE(SUM(status = 'In Progress'), 0) AS in_progress,
      COALESCE(SUM(status = 'Completed'), 0) AS completed,
      COALESCE(SUM(status <> 'Completed' AND deadline < NOW()), 0) AS overdue
    FROM tasks
  `);
  const row = rows[0];
  const total = Number(row.total);
  const completed = Number(row.completed);
  return {
    total,
    pending: Number(row.pending),
    inProgress: Number(row.in_progress),
    completed,
    overdue: Number(row.overdue),
    completionPercentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

async function getStatusOverview() {
  const [rows] = await pool.execute('SELECT status, COUNT(*) AS count FROM tasks GROUP BY status');
  const counts = Object.fromEntries(rows.map((row) => [row.status, Number(row.count)]));
  return ['Pending', 'In Progress', 'Completed'].map((status) => ({ status, count: counts[status] || 0 }));
}

async function getPriorityOverview() {
  const [rows] = await pool.execute('SELECT priority, COUNT(*) AS count FROM tasks GROUP BY priority');
  const counts = Object.fromEntries(rows.map((row) => [row.priority, Number(row.count)]));
  return ['Low', 'Medium', 'High', 'Urgent'].map((priority) => ({ priority, count: counts[priority] || 0 }));
}

async function getRecentTasks(limit = 5) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 5));
  const [rows] = await pool.execute(`
    SELECT t.id, t.title, t.priority, t.status, t.deadline, t.created_at,
           c.name AS category_name
    FROM tasks t
    LEFT JOIN categories c ON c.id = t.category_id
    ORDER BY t.created_at DESC, t.id DESC
    LIMIT ${safeLimit}
  `);
  return rows;
}

async function getUpcomingTasks(limit = 5) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 5));
  const [rows] = await pool.execute(`
    SELECT t.id, t.title, t.priority, t.status, t.deadline,
           c.name AS category_name,
           DATEDIFF(t.deadline, NOW()) AS days_left
    FROM tasks t
    LEFT JOIN categories c ON c.id = t.category_id
    WHERE t.status <> 'Completed' AND t.deadline >= NOW()
    ORDER BY t.deadline ASC
    LIMIT ${safeLimit}
  `);
  return rows;
}

module.exports = { getStats, getStatusOverview, getPriorityOverview, getRecentTasks, getUpcomingTasks };
