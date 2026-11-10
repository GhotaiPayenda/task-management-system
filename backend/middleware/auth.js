const HttpError = require('../utils/HttpError');
const { verifyToken } = require('../utils/jwt');
const adminModel = require('../models/adminModel');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw new HttpError(401, 'Authentication required. Please sign in.');
    }
    const token = header.slice(7).trim();
    if (!token) throw new HttpError(401, 'Authentication required. Please sign in.');

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      throw new HttpError(401, 'Your session is invalid or has expired. Please sign in again.');
    }

    const admin = await adminModel.findById(decoded.id);
    if (!admin) throw new HttpError(401, 'Admin account no longer exists.');

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { requireAuth };
