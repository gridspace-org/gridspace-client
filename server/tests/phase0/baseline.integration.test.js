import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../app.js';
import User from '../../models/User.model.js';
import Space from '../../models/Space.model.js';
import Booking from '../../models/Booking.model.js';

const createAccessToken = (userId) =>
  jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
      issuer: 'gridspace-backend',
      audience: 'gridspace-client',
    }
  );

describe('Phase 0 Baseline – Bookings & Spaces', () => {
  let hostUser;
  let regularUser;
  let space;
  let userToken;

  beforeEach(async () => {
    hostUser = await User.create({
      fullname: 'Host User',
      email: 'host@example.com',
      phoneNumber: '+2348000000000',
      password: 'Password123!',
      role: 'host',
      onboardingCompleted: true,
      emailVerified: true,
    });

    regularUser = await User.create({
      fullname: 'Regular User',
      email: 'user@example.com',
      phoneNumber: '+2348000000001',
      password: 'Password123!',
      role: 'user',
      onboardingCompleted: true,
      emailVerified: true,
    });

    space = await Space.create({
      hostId: hostUser._id,
      title: 'Phase 0 Baseline Space',
      description: 'Cozy workspace baseline fixture.',
      location: 'Lagos',
      address: '123 Baseline Street',
      pricePerHour: 5000,
      capacity: 10,
      amenities: ['WiFi', 'Air Conditioning'],
      purposes: ['Remote Work', 'Team Meetings'],
      images: ['https://example.com/image.jpg'],
      status: 'approved',
      isActive: true,
    });

    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    await Booking.create({
      userId: regularUser._id,
      spaceId: space._id,
      basePrice: 5000,
      markupPercentage: 15,
      markupAmount: 1500,
      totalAmount: 11500,
      hostEarnings: 10000,
      bookingType: 'hourly',
      duration: 2,
      startTime,
      endTime,
      guestCount: 4,
      status: 'upcoming',
      paymentStatus: 'paid',
      specialRequests: 'Baseline booking fixture',
      isActive: true,
    });

    userToken = createAccessToken(regularUser._id.toString());
  });

  test('captures baseline response for GET /api/v1/spaces', async () => {
    const response = await request(app)
      .get('/api/v1/spaces')
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message: 'Spaces retrieved successfully',
    });

    const [returnedSpace] = response.body.data.spaces;
    expect(returnedSpace).toEqual(
      expect.objectContaining({
        _id: space._id.toString(),
        title: space.title,
        location: space.location,
        pricePerHour: space.pricePerHour,
        hostId: expect.objectContaining({
          _id: hostUser._id.toString(),
          fullname: hostUser.fullname,
        }),
      })
    );

    expect(response.body.data.pagination).toEqual(
      expect.objectContaining({
        currentPage: 1,
        totalPages: 1,
        totalSpaces: 1,
        hasNextPage: false,
        hasPrevPage: false,
      })
    );
  });

  test('captures current output for GET /api/v1/bookings with authenticated user', async () => {
    expect(await Booking.countDocuments()).toBe(1);

    const response = await request(app)
      .get('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      success: false,
      message: 'Route not found',
    });
  });

  test('captures validation failure for POST /api/v1/bookings baseline', async () => {
    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({})
      .expect(400);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Validation Error',
    });

    expect(response.body.errors).toEqual(
      expect.arrayContaining(['Space ID is required'])
    );
  });
});
