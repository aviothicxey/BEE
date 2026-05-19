/*
  Centralized error handler for validation, JWT, Mongo, and custom errors.
  Place this after routes in app.js.
*/

const AppError = require('../utils/appError');

function errorHandler(err, req, res, next) {
  if (!err) {
    return next();
  }

  // Check if this is a view request (HTML page) vs API request
  const isViewRequest = req.path.match(/^\/(?!api\/)/) && !req.path.startsWith('/uploads');

  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Validation error.',
      details: err.details
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    if (isViewRequest) {
      return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode === 401 && isViewRequest) {
      return res.redirect('/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    if (err.statusCode === 403 && isViewRequest) {
      return res.status(403).render('403', { title: 'Access Denied' }).catch(() => {
        return res.status(403).json({
          success: false,
          message: 'Access denied.',
          details: err.details || undefined
        });
      });
    }
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details || undefined
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Mongo validation error.',
      details: err.errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format.'
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error.',
      details: err.keyValue
    });
  }

  console.error('Unhandled error: ', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
}

module.exports = errorHandler;
