require('dotenv').config({ quiet: true });
const readline = require('readline');
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const adminModel = require('../models/adminModel');
const { EMAIL_RE } = require('../utils/validators');

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index !== -1 ? process.argv[index + 1] : undefined;
}

function ask(question, { silent = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });
    if (silent) {
      rl._writeToOutput = function writeToOutput(text) {
        if (text.includes(question)) rl.output.write(text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (silent) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

async function createAdmin() {
  const name = arg('name') || process.env.ADMIN_NAME || (await ask('Admin name: '));
  const email = (arg('email') || process.env.ADMIN_EMAIL || (await ask('Admin email: '))).trim().toLowerCase();
  const password = arg('password') || process.env.ADMIN_PASSWORD || (await ask('Password (min 8 chars): ', { silent: true }));

  if (!name) throw new Error('Admin name is required.');
  if (!EMAIL_RE.test(email)) throw new Error('Enter a valid admin email.');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters.');

  const existing = await adminModel.findByEmail(email);
  if (existing) throw new Error('An admin with this email already exists.');

  const hash = await bcrypt.hash(password, 12);
  const admin = await adminModel.create({ name, email, password: hash });
  console.log(`Admin created: ${admin.email} (id ${admin.id})`);
}

createAdmin()
  .catch((error) => {
    console.error('Failed to create admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
