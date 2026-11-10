require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function init() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  };

  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection(config);
  console.log('Running database schema...');
  await connection.query(schema);

  const adminName = process.env.ADMIN_NAME?.trim();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    const dbName = process.env.DB_NAME || 'task_management_system';
    const [rows] = await connection.query(
      `SELECT id FROM \`${dbName}\`.admins WHERE email = ? LIMIT 1`,
      [adminEmail]
    );
    if (rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 12);
      await connection.query(
        `INSERT INTO \`${dbName}\`.admins (name, email, password) VALUES (?, ?, ?)`,
        [adminName || 'Administrator', adminEmail, hash]
      );
      console.log(`Initial admin created: ${adminEmail}`);
    } else {
      console.log(`Admin already exists: ${adminEmail}`);
    }
  }

  await connection.end();
  console.log('Database initialized successfully.');
}

init().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});
