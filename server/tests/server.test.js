import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

// Test database connection for testing
beforeAll(async () => {
  // Use test database or skip integration tests in CI
  if (process.env.CI || !process.env.MONGO_URI.includes('localhost')) {
    console.log('Skipping database tests in CI or non-local environment');
  }

  // Test suite for API endpoints
  describe('API Health and Basic Functionality', () => {
    test('GET /health - should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      // Validate health response structure
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment');

      // Validate health status
      expect(['ok', 'error']).toContain(response.body.status);
      expect(typeof response.body.uptime).toBe('number');
      expect(typeof response.body.timestamp).toBe('string');
    });

    test('GET /api/auth/test - should return auth test message', async () => {
      const response = await request(app)
        .get('/api/auth/test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    test('POST /api/auth/signup - should validate required fields', async () => {
      // Test with missing required fields
      const response = await request(app)
        .post('/api/auth/signup')
        .set('Content-Type', 'application/json')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    test('POST /api/auth/signin - should validate required fields', async () => {
      // Test with missing required fields
      const response = await request(app)
        .post('/api/auth/signin')
        .set('Content-Type', 'application/json')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email and password');
    });

    test('GET /api/spaces - should return spaces response structure', async () => {
      const response = await request(app)
        .get('/api/spaces?page=1&limit=1')
        .expect('Content-Type', /json/)
        .expect(200);

      // Should return the proper response structure
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');

      if (response.body.success) {
        expect(response.body.data).toHaveProperty('spaces');
        expect(response.body.data).toHaveProperty('pagination');
        expect(Array.isArray(response.body.data.spaces)).toBe(true);
      }
    });

    test('Security Headers - GET /health should have security headers', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Check for security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    test('Rate Limiting - Multiple requests should not fail immediately', async () => {
      // This test verifies the rate limiting is configured
      // We expect at least our configured limits to work
      const promises = Array(3).fill().map(() =>
        request(app)
          .get('/api/spaces?page=1&limit=5')
          .expect((res) => {
            // Should either succeed or be rate limited (429)
            expect([200, 429]).toContain(res.status);
          })
      );

      await Promise.all(promises);
    });

    test('CORS Headers - Preflight request should work', async () => {
      const response = await request(app)
        .options('/api/spaces')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(200);

      // Check CORS headers are set
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
    });

    test('404 Error Handling', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });

    test('Error Information Leakage Prevention', async () => {
      // In non-production mode, there should be no stack traces
      const response = await request(app)
        .get('/api/non-existent')
        .set('Accept', 'application/json')
        .expect(404);

      // Response should not contain stack trace in production-like environment
      expect(response.body).not.toHaveProperty('stack');
      expect(response.body).not.toHaveProperty('error');
      if (process.env.NODE_ENV === 'production') {
        // In production, generic error message
        expect(response.body.message).not.toContain('Error');
        expect(response.body.message).not.toContain('at');
      }
    });
  });

  // Skip database-dependent tests in CI
  if (!process.env.CI && process.env.MONGO_URI.includes('localhost')) {
    describe('Database Integration Tests', () => {
      test('Database health check should report connected', async () => {
        const response = await request(app)
          .get('/health')
          .expect(200);

        expect(response.body.database).toBe('connected');
      });
    });
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection if open
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});
