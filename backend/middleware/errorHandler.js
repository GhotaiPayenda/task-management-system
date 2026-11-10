const HttpError = require('../utils/HttpError');

function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';
  let details = error.details || null;

  // MySQL duplicate key
  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'A record with these details already exists.';
    details = null;
  }

  // MySQL foreign key constraint failure
  if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_ROW_IS_REFERENCED_2') {
    statusCode = 400;
    message = 'The related record does not exist or is still in use.';
    details = null;
  }

  if (statusCode >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, error);
    if (process.env.NODE_ENV === 'production') message = 'Internal server error.';
  }

  res.status(statusCode).json({
    message,
    ...(details ? { errors: details } : {}),
  });
}

module.exports = { notFound, errorHandler };
