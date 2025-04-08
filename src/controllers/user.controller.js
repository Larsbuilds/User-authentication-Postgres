const bcrypt = require('bcrypt');
const { AppError } = require('../middleware/errorHandler');
const db = require('../config/database');
const logger = require('../utils/logger');

const getProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const result = await db.query(
      'SELECT user_id, username, email, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { username, email } = req.body;

    // Check if user exists
    const user = await db.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Check if email or username is already taken
    if (email || username) {
      const existingUser = await db.query(
        'SELECT * FROM users WHERE (email = $1 OR username = $2) AND user_id != $3',
        [email || user.rows[0].email, username || user.rows[0].username, userId]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('Email or username already taken', 400);
      }
    }

    // Update user
    const result = await db.query(
      'UPDATE users SET username = COALESCE($1, username), email = COALESCE($2, email) WHERE user_id = $3 RETURNING user_id, username, email, created_at',
      [username, email, userId]
    );

    logger.info(`User updated: ${result.rows[0].email}`);

    res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteProfile = async (req, res, next) => {
  try {
    const { userId } = req.user;

    // Delete user's posts first (due to foreign key constraint)
    await db.query(
      'DELETE FROM posts WHERE author_id = $1',
      [userId]
    );

    // Delete user
    await db.query(
      'DELETE FROM users WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT user_id, username, email, created_at FROM users'
    );

    res.status(200).json({
      status: 'success',
      data: {
        users: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      'SELECT user_id, username, email, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await db.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      throw new AppError('User with this email or username already exists', 400);
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // Create user
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id, username, email, created_at',
      [username, email, hashedPassword]
    );

    logger.info(`User created: ${email}`);

    res.status(201).json({
      status: 'success',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await db.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Delete user's posts first (due to foreign key constraint)
    await db.query(
      'DELETE FROM posts WHERE author_id = $1',
      [userId]
    );

    // Delete user
    await db.query(
      'DELETE FROM users WHERE user_id = $1',
      [userId]
    );

    logger.info(`User deleted: ${user.rows[0].email}`);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

const getUserPosts = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await db.query(
      'SELECT * FROM users WHERE user_id = $1',
      [userId]
    );

    if (user.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Get user's posts
    const posts = await db.query(
      'SELECT * FROM posts WHERE author_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        posts: posts.rows
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
  getAllUsers,
  getUserById,
  createUser,
  deleteUser,
  getUserPosts
}; 