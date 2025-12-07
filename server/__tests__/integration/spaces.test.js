import request from 'supertest';
import app from '../../app.js';
import {
  createTestUser,
  createTestHost,
  createTestSpace,
  createAndSignInHost,
} from '../helpers/testUtils.js';

describe('Spaces API', () => {
  describe('GET /api/v1/spaces', () => {
    it('should get all spaces without authentication', async () => {
      const host = await createTestHost();
      await createTestSpace(host._id);

      const response = await request(app)
        .get('/api/v1/spaces')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.stringContaining('retrieved'),
        data: {
          spaces: expect.any(Array),
          pagination: expect.objectContaining({
            currentPage: expect.any(Number),
            totalPages: expect.any(Number),
            totalSpaces: expect.any(Number),
          }),
        },
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/spaces?page=1&limit=5')
        .expect(200);

      expect(response.body.data.pagination).toMatchObject({
        currentPage: 1,
        limit: 5,
      });
    });

    it('should filter by location', async () => {
      const host = await createTestHost();
      await createTestSpace(host._id, { location: 'Lagos' });
      await createTestSpace(host._id, { location: 'Abuja' });

      const response = await request(app)
        .get('/api/v1/spaces?location=Lagos')
        .expect(200);

      expect(response.body.data.spaces.every(space => 
        space.location.includes('Lagos')
      )).toBe(true);
    });
  });

  describe('POST /api/v1/spaces', () => {
    it('should create a space as host', async () => {
      const { token } = await createAndSignInHost();

      const spaceData = {
        title: 'New Workspace',
        description: 'A beautiful workspace',
        location: 'Lagos',
        address: '123 Main Street',
        pricePerHour: 5000,
        capacity: 10,
        amenities: ['WiFi', 'Air Conditioning'],
        purposes: ['Remote Work'],
      };

      const response = await request(app)
        .post('/api/v1/spaces')
        .set('Authorization', `Bearer ${token}`)
        .send(spaceData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          title: spaceData.title,
          location: spaceData.location,
          pricePerHour: spaceData.pricePerHour,
        }),
      });
    });

    it('should reject space creation without authentication', async () => {
      const response = await request(app)
        .post('/api/v1/spaces')
        .send({ title: 'Test Space' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject space creation with missing required fields', async () => {
      const { token } = await createAndSignInHost();

      const response = await request(app)
        .post('/api/v1/spaces')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Incomplete Space' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/spaces/:id', () => {
    it('should get a single space by ID', async () => {
      const host = await createTestHost();
      const space = await createTestSpace(host._id);

      const response = await request(app)
        .get(`/api/v1/spaces/${space._id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: expect.objectContaining({
          _id: space._id.toString(),
          title: space.title,
        }),
      });
    });

    it('should return 404 for non-existent space', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/v1/spaces/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

