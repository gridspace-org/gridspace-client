import request from 'supertest';
import app from '../../app.js';
import User from '../../models/User.model.js';
import {
  createTestUser,
  createAndSignInUser,
  generateToken,
} from '../helpers/testUtils.js';

describe('Auth API', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        fullname: 'John Doe',
        email: `john-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        phonenumber: '+2348000000000',
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .field('fullname', userData.fullname)
        .field('email', userData.email)
        .field('password', userData.password)
        .field('phonenumber', userData.phonenumber)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('successful'),
      });

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject signup with missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject signup with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .field('fullname', 'John Doe')
        .field('email', 'invalid-email')
        .field('password', 'SecurePass123!')
        .field('phonenumber', '+2348000000000')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject signup with duplicate email', async () => {
      const user = await createTestUser();

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .field('fullname', 'John Doe')
        .field('email', user.email)
        .field('password', 'SecurePass123!')
        .field('phonenumber', '+2348000000001')
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/signin', () => {
    let testUser;
    const password = 'TestPassword123!';

    beforeEach(async () => {
      testUser = await createTestUser({ password, emailVerified: true });
    });

    it('should sign in successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: testUser.email,
          password,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('successful'),
      });

      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject signin with invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: 'nonexistent@example.com',
          password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject signin with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signin')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject signin with missing fields', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signin')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const { user, token } = await createAndSignInUser();

      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: expect.objectContaining({
            _id: user._id.toString(),
            email: user.email,
          }),
        },
      });
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
      const { token } = await createAndSignInUser();

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('logout'),
      });
    });
  });

  describe('POST /api/v1/auth/refresh-token', () => {
    it('should refresh token successfully', async () => {
      const { token } = await createAndSignInUser();

      const response = await request(app)
        .post('/api/v1/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      });
    });
  });
});

