const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params
    });

    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      errors: err.errors
    });
  } else {
    // Production mode
    if (err.isOperational) {
      logger.error('Operational Error:', {
        message: err.message,
        path: req.path,
        method: req.method
      });

      const response = {
        status: err.status,
        message: err.message
      };

      if (err.errors) {
        response.errors = err.errors;
      }

      res.status(err.statusCode).json(response);
    } else {
      logger.error('Programming Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
      });

      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

module.exports = {
  AppError,
  errorHandler
}; 