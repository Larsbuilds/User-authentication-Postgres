const request = require('supertest');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.test') });

const app = require('../index');
const db = require('../config/database');

describe('Authentication API', () => {
  beforeAll(async () => {
    try {
      // Run migrations
      const migrate = require('../db/migrate');
      await migrate();

      // Start a transaction
      await db.query('BEGIN');
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

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.user_id).toBeDefined();
      expect(response.body.data.user.username).toBe('testuser');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should not register a user with invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'a', // Too short
          email: 'invalid-email',
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('fail');
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should not login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('fail');
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
}); 