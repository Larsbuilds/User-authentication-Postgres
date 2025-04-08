const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/auth');

// Profile routes (require authentication)
router.get('/profile', authMiddleware, userController.getProfile);

router.put(
  '/profile',
  authMiddleware,
  [
    body('username')
      .optional()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail()
  ],
  validateRequest,
  userController.updateProfile
);

router.delete('/profile', authMiddleware, userController.deleteProfile);

// Regular user routes (require authentication)
router.use(authMiddleware);

// Get all users
router.get('/', userController.getAllUsers);

// Get user by ID
router.get('/:userId', userController.getUserById);

// Create user
router.post(
  '/',
  [
    body('username')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ],
  validateRequest,
  userController.createUser
);

// Delete user
router.delete('/:userId', userController.deleteUser);

// Get user's posts
router.get('/:userId/posts', userController.getUserPosts);

module.exports = router; 