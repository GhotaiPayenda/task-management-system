const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/env');

function signToken(admin) {
  return jwt.sign(
    { id: admin.id, email: admin.email, role: 'admin' },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}

module.exports = { signToken, verifyToken };
