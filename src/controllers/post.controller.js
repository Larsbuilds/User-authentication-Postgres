const { AppError } = require('../middleware/errorHandler');
const db = require('../config/database');
const logger = require('../utils/logger');

const getAllPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await db.query(`
      SELECT p.*, u.username as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.user_id 
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await db.query('SELECT COUNT(*) FROM posts');
    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      status: 'success',
      data: {
        posts: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          limit: parseInt(limit),
          totalPosts
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const result = await db.query(`
      SELECT p.*, u.username as author_name 
      FROM posts p 
      JOIN users u ON p.author_id = u.user_id 
      WHERE p.post_id = $1
    `, [postId]);

    if (result.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        post: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    const { title, content, tags } = req.body;
    const author_id = req.user.userId;

    // Create post
    const result = await db.query(
      'INSERT INTO posts (author_id, title, content, tags) VALUES ($1, $2, $3, $4) RETURNING *',
      [author_id, title, content, tags || []]
    );

    // Get author name
    const authorResult = await db.query(
      'SELECT username FROM users WHERE user_id = $1',
      [author_id]
    );

    const post = {
      ...result.rows[0],
      author_name: authorResult.rows[0].username
    };

    logger.info(`Post created by user ${author_id}: ${title}`);

    res.status(201).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
    const userId = req.user.userId;

    // Check if post exists and user owns it
    const currentPost = await db.query(
      'SELECT * FROM posts WHERE post_id = $1',
      [postId]
    );

    if (currentPost.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    if (currentPost.rows[0].author_id !== userId) {
      throw new AppError('Not authorized to update this post', 403);
    }

    // Update only provided fields
    const updatedPost = {
      title: title || currentPost.rows[0].title,
      content: content || currentPost.rows[0].content,
      tags: tags || currentPost.rows[0].tags
    };

    const result = await db.query(
      'UPDATE posts SET title = $1, content = $2, tags = $3, updated_at = CURRENT_TIMESTAMP WHERE post_id = $4 RETURNING *',
      [updatedPost.title, updatedPost.content, updatedPost.tags, postId]
    );

    // Get author name
    const authorResult = await db.query(
      'SELECT username FROM users WHERE user_id = $1',
      [userId]
    );

    const post = {
      ...result.rows[0],
      author_name: authorResult.rows[0].username
    };

    logger.info(`Post ${postId} updated`);

    res.status(200).json({
      status: 'success',
      data: {
        post
      }
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    // Check if post exists and user owns it
    const post = await db.query(
      'SELECT * FROM posts WHERE post_id = $1',
      [postId]
    );

    if (post.rows.length === 0) {
      throw new AppError('Post not found', 404);
    }

    if (post.rows[0].author_id !== userId) {
      throw new AppError('Not authorized to delete this post', 403);
    }

    // Delete post
    await db.query(
      'DELETE FROM posts WHERE post_id = $1',
      [postId]
    );

    logger.info(`Post ${postId} deleted`);

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
}; 