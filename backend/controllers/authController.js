const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const adminModel = require('../models/adminModel');
const { signToken } = require('../utils/jwt');
const { validateLogin, validateRegistration } = require('../utils/validators');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

// A one-time random hash keeps failed-login timing similar without a hardcoded credential.
const dummyHashPromise = bcrypt.hash(crypto.randomUUID(), 12);

const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLogin(req.body);

  const admin = await adminModel.findByEmail(email, { withPassword: true });
  const hash = admin ? admin.password : await dummyHashPromise;
  const matches = await bcrypt.compare(password, hash);

  if (!admin || !matches) {
    throw new HttpError(401, 'Invalid email or password.');
  }

  const token = signToken(admin);
  const { password: _password, ...safeAdmin } = admin;

  res.json({ token, admin: safeAdmin, message: 'Signed in successfully.' });
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = validateRegistration(req.body);

  const existing = await adminModel.findByEmail(email);
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await adminModel.create({ name, email, password: passwordHash });
  const token = signToken(admin);

  res.status(201).json({ token, admin, message: 'Account created successfully.' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = { login, register, me };
