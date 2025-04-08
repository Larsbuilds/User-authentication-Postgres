const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const logger = require('../utils/logger');
const db = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await db.query(
      'SELECT user_id FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (user.rows.length === 0) {
      throw new AppError('Invalid token', 401);
    }

    // Add user to request
    req.user = { userId: decoded.userId };

    logger.info(`User ${decoded.userId} authenticated`);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

module.exports = authMiddleware; 