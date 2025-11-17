import request from 'supertest';
import app from '../../app.js';
import User from '../../models/User.model.js';
import Space from '../../models/Space.model.js';
import Booking from '../../models/Booking.model.js';
import jwt from 'jsonwebtoken';

/**
 * Create a test user and return user object
 */
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    fullname: 'Test User',
    email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
    phoneNumber: `+234${Math.floor(Math.random() * 1000000000)}`,
    password: 'TestPassword123!',
    role: 'user',
    emailVerified: true,
    onboardingCompleted: true,
    ...overrides,
  };

  const user = new User(defaultUser);
  await user.save();
  return user;
};

/**
 * Create a test host user
 */
export const createTestHost = async (overrides = {}) => {
  return createTestUser({
    role: 'host',
    ...overrides,
  });
};

/**
 * Create a test space
 */
export const createTestSpace = async (hostId, overrides = {}) => {
  const defaultSpace = {
    hostId,
    title: 'Test Space',
    description: 'A test workspace',
    location: 'Lagos',
    address: '123 Test Street',
    pricePerHour: 5000,
    capacity: 10,
    amenities: ['WiFi', 'Air Conditioning'],
    purposes: ['Remote Work'],
    images: ['https://example.com/image.jpg'],
    status: 'approved',
    isActive: true,
    ...overrides,
  };

  const space = new Space(defaultSpace);
  await space.save();
  return space;
};

/**
 * Create a test booking
 */
export const createTestBooking = async (userId, spaceId, overrides = {}) => {
  const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

  const defaultBooking = {
    userId,
    spaceId,
    basePrice: 5000,
    markupPercentage: 15,
    markupAmount: 750,
    totalAmount: 5750,
    hostEarnings: 5000,
    bookingType: 'hourly',
    duration: 2,
    startTime,
    endTime,
    guestCount: 2,
    status: 'pending',
    paymentStatus: 'pending',
    isActive: true,
    ...overrides,
  };

  const booking = new Booking(defaultBooking);
  await booking.save();
  return booking;
};

/**
 * Generate JWT token for testing
 */
export const generateToken = (userId, type = 'access') => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = type === 'access' 
    ? process.env.ACCESS_TOKEN_EXPIRES || '15m'
    : process.env.REFRESH_TOKEN_EXPIRES || '7d';

  return jwt.sign(
    { id: userId, type },
    secret,
    {
      expiresIn,
      issuer: 'gridspace-backend',
      audience: 'gridspace-client',
    }
  );
};

/**
 * Sign in and get auth token
 */
export const signInUser = async (email, password) => {
  const response = await request(app)
    .post('/api/v1/auth/signin')
    .send({ email, password });

  if (response.status === 200 && response.body.success) {
    return {
      token: response.body.data?.tokens?.accessToken || response.body.data?.accessToken,
      refreshToken: response.body.data?.tokens?.refreshToken || response.body.data?.refreshToken,
      user: response.body.data?.user,
    };
  }

  throw new Error(`Sign in failed: ${response.body.message || 'Unknown error'}`);
};

/**
 * Create user and sign in, return token and user
 */
export const createAndSignInUser = async (overrides = {}) => {
  const user = await createTestUser(overrides);
  const auth = await signInUser(user.email, overrides.password || 'TestPassword123!');
  return { user, ...auth };
};

/**
 * Create host and sign in, return token and user
 */
export const createAndSignInHost = async (overrides = {}) => {
  const user = await createTestHost(overrides);
  const auth = await signInUser(user.email, overrides.password || 'TestPassword123!');
  return { user, ...auth };
};

/**
 * Make authenticated request
 */
export const authenticatedRequest = (method, url, token, data = {}) => {
  const req = request(app)[method.toLowerCase()](url)
    .set('Authorization', `Bearer ${token}`);

  if (Object.keys(data).length > 0) {
    if (method === 'GET') {
      return req.query(data);
    }
    return req.send(data);
  }

  return req;
};

/**
 * Wait for async operations (useful for testing webhooks, etc.)
 */
export const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

