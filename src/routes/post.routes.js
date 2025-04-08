const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:postId', postController.getPostById);

// Protected routes
router.use(authMiddleware);

// Create post
router.post(
  '/',
  [
    body('title')
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters')
      .matches(/^[a-zA-Z0-9\s.,!?]+$/)
      .withMessage('Title can only contain letters, numbers, spaces, and basic punctuation'),
    body('content')
      .isLength({ min: 1, max: 10000 })
      .withMessage('Content must be between 1 and 10000 characters'),
    body('tags')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 tags allowed')
      .custom((tags) => {
        if (tags) {
          return tags.every(tag => 
            /^[a-zA-Z0-9-]+$/.test(tag) && tag.length <= 50
          );
        }
        return true;
      })
      .withMessage('Tags can only contain letters, numbers, and hyphens, and must be 50 characters or less')
  ],
  validateRequest,
  postController.createPost
);

// Update post
router.put(
  '/:postId',
  [
    body('title')
      .optional()
      .isLength({ min: 1, max: 255 })
      .withMessage('Title must be between 1 and 255 characters')
      .matches(/^[a-zA-Z0-9\s.,!?]+$/)
      .withMessage('Title can only contain letters, numbers, spaces, and basic punctuation'),
    body('content')
      .optional()
      .isLength({ min: 1, max: 10000 })
      .withMessage('Content must be between 1 and 10000 characters'),
    body('tags')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 tags allowed')
      .custom((tags) => {
        if (tags) {
          return tags.every(tag => 
            /^[a-zA-Z0-9-]+$/.test(tag) && tag.length <= 50
          );
        }
        return true;
      })
      .withMessage('Tags can only contain letters, numbers, and hyphens, and must be 50 characters or less')
  ],
  validateRequest,
  postController.updatePost
);

// Delete post
router.delete('/:postId', postController.deletePost);

module.exports = router; 