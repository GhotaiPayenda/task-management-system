const { pool } = require('../config/db');

const SAFE_FIELDS = 'id, name, email, created_at, updated_at';

async function findByEmail(email, { withPassword = false } = {}) {
  const fields = withPassword ? `${SAFE_FIELDS}, password` : SAFE_FIELDS;
  const [rows] = await pool.execute(`SELECT ${fields} FROM admins WHERE email = ? LIMIT 1`, [email]);
  return rows[0] || null;
}

async function findById(id, { withPassword = false } = {}) {
  const fields = withPassword ? `${SAFE_FIELDS}, password` : SAFE_FIELDS;
  const [rows] = await pool.execute(`SELECT ${fields} FROM admins WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function create({ name, email, password }) {
  const [result] = await pool.execute(
    'INSERT INTO admins (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return findById(result.insertId);
}

module.exports = { findByEmail, findById, create };
