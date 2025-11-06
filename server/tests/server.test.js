import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

// Ensure database connection is ready before tests
beforeAll(async () => {
  // Use test database or skip integration tests in CI
  if (process.env.CI || (process.env.MONGO_URI && !process.env.MONGO_URI.includes('localhost'))) {
    console.log('Skipping database setup in CI or non-local environment for tests');
    return; // Exit early if we are skipping DB tests
  }
  // NOTE: app.js already connects to MongoDB at startup
  // We can add a check here if needed or assume it's connected
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection if open
  // This needs to be smart enough not to break if DB wasn't connected in beforeAll
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    await mongoose.connection.close();
  }
});

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

  test('GET /api/v1/auth/test - should return auth test message', async () => { // Updated path for API Versioning
    const response = await request(app)
      .get('/api/v1/auth/test')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('message');
    expect(typeof response.body.message).toBe('string');
  });

  test('POST /api/v1/auth/signup - should validate required fields', async () => { // Updated path for API Versioning
    // Test with missing required fields
    const response = await request(app)
      .post('/api/v1/auth/signup')
      .set('Content-Type', 'application/json')
      .send({})
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/(fullname|email|password|phoneNumber) is required/i); // Updated to match Joi errors
  });

  test('POST /api/v1/auth/signin - should validate required fields', async () => { // Updated path for API Versioning
    // Test with missing required fields
    const response = await request(app)
      .post('/api/v1/auth/signin')
      .set('Content-Type', 'application/json')
      .send({})
      .expect('Content-Type', /json/i) // Changed to case-insensitive regex
      .expect(400);

    expect(response.body.success).toBe(false);
    // Modified to be more generic, as the specific message "email and password" might change with Joi validation
    expect(response.body.message).toMatch(/(email|password) is required/i); // Updated to match Joi errors
  });

  test('GET /api/v1/spaces - should return spaces response structure', async () => { // Updated path for API Versioning
    const response = await request(app)
      .get('/api/v1/spaces?page=1&limit=1')
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
        .get('/api/v1/spaces?page=1&limit=5') // Updated path for API Versioning
        .expect((res) => {
          // Should either succeed or be rate limited (429)
          expect([200, 429]).toContain(res.status);
        })
    );

    await Promise.all(promises);
  });

  test('CORS Headers - Preflight request should work', async () => {
    const response = await request(app)
      .options('/api/v1/spaces') // Updated path for API Versioning
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
      .get('/api/v1/non-existent') // Updated path for API Versioning (if this route exists)
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

// Database Integration Tests - conditional execution moved outside describe block
if (!process.env.CI && process.env.MONGO_URI && process.env.MONGO_URI.includes('localhost')) {
  describe('Database Integration Tests', () => {
    test('Database health check should report connected', async () => {
      // Ensure the database is actually connected before running this test
      // If `connectDB` is called in app.js, it should be connected by now
      // No need to explicitly call app.connectDB() here as it's done in server.js at startup
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.database.state).toBe('connected'); // Updated to check for database.state
    });
  });
}
