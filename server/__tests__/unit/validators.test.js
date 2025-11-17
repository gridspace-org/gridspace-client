import { createBookingValidation } from '../../validators/booking.validator.js';
import { signupSchema, signinSchema } from '../../validators/auth.validator.js';

describe('Validators', () => {
  describe('Booking Validator', () => {
    it('should validate correct booking data', () => {
      const validBooking = {
        spaceId: '507f1f77bcf86cd799439011',
        startTime: '2099-01-20T10:00:00.000Z',
        endTime: '2099-01-20T12:00:00.000Z',
        guestCount: 2,
      };

      const { error, value } = createBookingValidation.validate(validBooking);
      expect(error).toBeUndefined();
      expect(value).toMatchObject(validBooking);
    });

    it('should reject booking with missing spaceId', () => {
      const invalidBooking = {
        startTime: '2099-01-20T10:00:00.000Z',
        endTime: '2099-01-20T12:00:00.000Z',
      };

      const { error } = createBookingValidation.validate(invalidBooking);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('Space ID is required');
    });

    it('should reject booking with invalid dates', () => {
      const invalidBooking = {
        spaceId: '507f1f77bcf86cd799439011',
        startTime: '2099-01-20T12:00:00.000Z',
        endTime: '2099-01-20T10:00:00.000Z', // End before start
      };

      const { error } = createBookingValidation.validate(invalidBooking);
      expect(error).toBeDefined();
    });
  });

  describe('Auth Validator', () => {
    it('should validate correct signup data', () => {
      const validSignup = {
        fullname: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        phonenumber: '+2348000000000',
      };

      const { error } = signupSchema.validate(validSignup);
      expect(error).toBeUndefined();
    });

    it('should reject signup with invalid email', () => {
      const invalidSignup = {
        fullname: 'John Doe',
        email: 'invalid-email',
        password: 'SecurePass123!',
        phonenumber: '+2348000000000',
      };

      const { error } = signupSchema.validate(invalidSignup);
      expect(error).toBeDefined();
    });

    it('should validate correct signin data', () => {
      const validSignin = {
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const { error } = signinSchema.validate(validSignin);
      expect(error).toBeUndefined();
    });

    it('should reject signin with missing email', () => {
      const invalidSignin = {
        password: 'SecurePass123!',
      };

      const { error } = signinSchema.validate(invalidSignin);
      expect(error).toBeDefined();
    });
  });
});

