import request from 'supertest';
import app from '../../app.js';
import {
  createTestUser,
  createTestHost,
  createTestSpace,
  createTestBooking,
  createAndSignInUser,
  createAndSignInHost,
} from '../helpers/testUtils.js';

describe('Bookings API', () => {
  describe('POST /api/v1/bookings', () => {
    it('should create a booking successfully', async () => {
      const host = await createTestHost();
      const space = await createTestSpace(host._id);
      const { token, user } = await createAndSignInUser();

      const bookingData = {
        spaceId: space._id.toString(),
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        endTime: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
        guestCount: 2,
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          spaceId: space._id.toString(),
          userId: user._id.toString(),
          status: 'pending',
        }),
      });
    });

    it('should reject booking creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/bookings')
        .send({ spaceId: '507f1f77bcf86cd799439011' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject booking with missing required fields', async () => {
      const { token } = await createAndSignInUser();

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/bookings', () => {
    it('should get user bookings', async () => {
      const host = await createTestHost();
      const space = await createTestSpace(host._id);
      const { token, user } = await createAndSignInUser();
      await createTestBooking(user._id, space._id);

      const response = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          bookings: expect.any(Array),
        },
      });

      expect(response.body.data.bookings.length).toBeGreaterThan(0);
    });

    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/bookings/host', () => {
    it('should get host bookings', async () => {
      const { token, user: host } = await createAndSignInHost();
      const space = await createTestSpace(host._id);
      const regularUser = await createTestUser();
      await createTestBooking(regularUser._id, space._id);

      const response = await request(app)
        .get('/api/v1/bookings/host')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          bookings: expect.any(Array),
          pagination: expect.any(Object),
        },
      });
    });

    it('should reject request from non-host user', async () => {
      const { token } = await createAndSignInUser();

      const response = await request(app)
        .get('/api/v1/bookings/host')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/bookings/:id/status', () => {
    it('should update booking status as host', async () => {
      const { token: hostToken, user: host } = await createAndSignInHost();
      const space = await createTestSpace(host._id);
      const regularUser = await createTestUser();
      const booking = await createTestBooking(regularUser._id, space._id);

      const response = await request(app)
        .put(`/api/v1/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${hostToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          booking: expect.objectContaining({
            status: 'confirmed',
          }),
        },
      });
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    it('should cancel a booking', async () => {
      const host = await createTestHost();
      const space = await createTestSpace(host._id);
      const { token, user } = await createAndSignInUser();
      
      // Create booking far in future to allow cancellation
      const booking = await createTestBooking(user._id, space._id, {
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      });

      const response = await request(app)
        .delete(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          booking: expect.objectContaining({
            status: 'cancelled',
          }),
        },
      });
    });
  });
});

