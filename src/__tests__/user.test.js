const request = require('supertest');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

const app = require('../index');
const db = require('../config/database');

describe('User API', () => {
  let authToken;
  let userId;

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

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.username).toBe('testuser');
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('No token provided');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile with valid data', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'updateduser',
          email: 'updated@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user.username).toBe('updateduser');
      expect(response.body.data.user.email).toBe('updated@example.com');
    });

    it('should not update profile with invalid data', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          username: 'a', // Too short
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });
  });

  describe('DELETE /api/users/profile', () => {
    it('should delete user profile', async () => {
      const response = await request(app)
        .delete('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted
      const verifyResponse = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(verifyResponse.status).toBe(401);
    });
  });
}); 