const { pool } = require('../config/db');

const BASE_SELECT = `
  SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
         COUNT(t.id) AS task_count
  FROM categories c
  LEFT JOIN tasks t ON t.category_id = c.id
`;

async function findAll() {
  const [rows] = await pool.execute(
    `${BASE_SELECT} GROUP BY c.id, c.name, c.description, c.created_at, c.updated_at
     ORDER BY c.created_at DESC, c.id DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(`${BASE_SELECT} WHERE c.id = ? GROUP BY c.id LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findByName(name, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?) AND id <> ? LIMIT 1'
    : 'SELECT id, name FROM categories WHERE LOWER(name) = LOWER(?) LIMIT 1';
  const params = excludeId ? [name, excludeId] : [name];
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
}

async function create({ name, description }) {
  const [result] = await pool.execute(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description]
  );
  return findById(result.insertId);
}

async function update(id, fields) {
  const sets = [];
  const params = [];
  if (fields.name !== undefined) {
    sets.push('name = ?');
    params.push(fields.name);
  }
  if (fields.description !== undefined) {
    sets.push('description = ?');
    params.push(fields.description);
  }
  if (sets.length === 0) return findById(id);
  params.push(id);
  await pool.execute(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`, params);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function countTasks(id) {
  const [rows] = await pool.execute('SELECT COUNT(*) AS total FROM tasks WHERE category_id = ?', [id]);
  return Number(rows[0].total);
}

async function reassignTasks(fromId, toId) {
  const [result] = await pool.execute('UPDATE tasks SET category_id = ? WHERE category_id = ?', [toId, fromId]);
  return result.affectedRows;
}

async function uncategorizeTasks(id) {
  const [result] = await pool.execute('UPDATE tasks SET category_id = NULL WHERE category_id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  remove,
  countTasks,
  reassignTasks,
  uncategorizeTasks,
};
