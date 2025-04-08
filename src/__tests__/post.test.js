const request = require('supertest');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

const app = require('../index');
const db = require('../config/database');

describe('Post API', () => {
  let authToken;
  let userId;
  let postId;

  beforeAll(async () => {
    try {
      // Run migrations
      const migrate = require('../db/migrate');
      await migrate();

      // Start a transaction
      await db.query('BEGIN');

      // Create a test user and get token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });

      authToken = response.body.data.token;
      userId = response.body.data.user.user_id;
    } catch (error) {
      console.error('Error setting up test database:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Rollback the transaction
      await db.query('ROLLBACK');
      await db.pool.end();
    } catch (error) {
      console.error('Error cleaning up test database:', error);
      throw error;
    }
  });

  describe('POST /api/posts', () => {
    it('should create a new post with valid data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post content',
          tags: ['test', 'example']
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.post).toBeDefined();
      expect(response.body.data.post.title).toBe('Test Post');
      expect(response.body.data.post.content).toBe('This is a test post content');
      expect(response.body.data.post.tags).toEqual(['test', 'example']);

      postId = response.body.data.post.post_id;
    });

    it('should not create post without authentication', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          content: 'This is a test post content',
          tags: ['test']
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No token provided');
    });

    it('should not create post with invalid data', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Empty title
          content: 'x'.repeat(5001), // Content too long
          tags: ['']  // Empty tag
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts', async () => {
      const response = await request(app)
        .get('/api/posts');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      expect(response.body.data.posts.length).toBeGreaterThan(0);
    });

    it('should get posts with pagination', async () => {
      const response = await request(app)
        .get('/api/posts')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.posts)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should get post by id', async () => {
      const response = await request(app)
        .get(`/api/posts/${postId}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.post).toBeDefined();
      expect(response.body.data.post.post_id).toBe(postId);
    });

    it('should return 404 for non-existent post', async () => {
      const response = await request(app)
        .get('/api/posts/99999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Post not found');
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update post with valid data', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Post',
          content: 'This is updated content',
          tags: ['updated']
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.post.title).toBe('Updated Post');
      expect(response.body.data.post.content).toBe('This is updated content');
      expect(response.body.data.post.tags).toEqual(['updated']);
    });

    it('should not update post without authentication', async () => {
      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .send({
          title: 'Updated Post',
          content: 'This is updated content'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
    });

    it('should not update another user\'s post', async () => {
      // Create another user
      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'otheruser',
          email: 'other@example.com',
          password: 'Password123!'
        });

      const otherUserToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          title: 'Unauthorized Update',
          content: 'This should not work'
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Not authorized to update this post');
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete post', async () => {
      const response = await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Post deleted successfully');

      // Verify post is deleted
      const verifyResponse = await request(app)
        .get(`/api/posts/${postId}`);

      expect(verifyResponse.status).toBe(404);
    });

    it('should not delete non-existent post', async () => {
      const response = await request(app)
        .delete('/api/posts/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Post not found');
    });
  });
}); 