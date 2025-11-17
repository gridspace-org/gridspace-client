# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for the GridSpace API backend, including integration tests, unit tests, and health checks. The suite is designed to work seamlessly in both local development and CI/CD environments.

## Test Structure

```
__tests__/
├── setup.js                 # Global test setup (MongoDB, environment)
├── helpers/
│   └── testUtils.js        # Test utilities and helpers
├── integration/
│   ├── auth.test.js        # Authentication endpoints
│   ├── spaces.test.js      # Spaces CRUD operations
│   ├── bookings.test.js    # Bookings management
│   └── health.test.js      # Health checks and error handling
└── unit/
    └── validators.test.js   # Input validation tests
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### CI/CD

```bash
# Run tests optimized for CI
npm run test:ci
```

## Test Environment

- **Database**: Uses `mongodb-memory-server` for isolated in-memory MongoDB instances
- **Environment**: Automatically sets `NODE_ENV=test`
- **Isolation**: Each test suite runs with a fresh database
- **Cleanup**: Collections are cleared between tests

## Test Utilities

### Creating Test Data

```javascript
import { createTestUser, createTestHost, createTestSpace } from '../helpers/testUtils.js';

// Create a regular user
const user = await createTestUser();

// Create a host user
const host = await createTestHost();

// Create a space
const space = await createTestSpace(host._id);
```

### Authentication Helpers

```javascript
import { createAndSignInUser, signInUser } from '../helpers/testUtils.js';

// Create user and get auth token
const { user, token } = await createAndSignInUser();

// Sign in existing user
const { token } = await signInUser('user@example.com', 'password');
```

### Making Authenticated Requests

```javascript
import { authenticatedRequest } from '../helpers/testUtils.js';

const response = await authenticatedRequest('GET', '/api/v1/spaces', token);
```

## Writing New Tests

### Integration Test Example

```javascript
import request from 'supertest';
import app from '../../app.js';
import { createAndSignInUser } from '../helpers/testUtils.js';

describe('My Feature API', () => {
  it('should do something', async () => {
    const { token } = await createAndSignInUser();
    
    const response = await request(app)
      .get('/api/v1/my-endpoint')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
  });
});
```

## CI/CD Integration

The test suite is optimized for CI/CD with:

- **Fast execution**: In-memory database, no external dependencies
- **Isolation**: Each test runs independently
- **Coverage reporting**: Generates coverage reports for CI
- **Environment variables**: Automatically configured for test environment

### GitHub Actions Example

```yaml
- name: Run tests
  run: npm run test:ci
  env:
    NODE_ENV: test
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
```

## Coverage Goals

- **Integration Tests**: 80%+ coverage of API endpoints
- **Unit Tests**: 90%+ coverage of validators and utilities
- **Critical Paths**: 100% coverage of authentication and payment flows

## Troubleshooting

### Tests failing with database connection errors

- Ensure `mongodb-memory-server` is installed
- Check that test timeout is sufficient (default: 30s)

### Tests failing with authentication errors

- Verify JWT_SECRET is set in test environment
- Check token generation in test utilities

### Slow test execution

- Use `test:ci` for optimized parallel execution
- Consider reducing test data size
- Check for memory leaks in test cleanup

## Best Practices

1. **Always clean up**: Use `afterEach` to clean collections
2. **Use helpers**: Leverage test utilities for common operations
3. **Isolate tests**: Each test should be independent
4. **Test edge cases**: Include error scenarios and validation
5. **Keep tests fast**: Avoid unnecessary database operations

