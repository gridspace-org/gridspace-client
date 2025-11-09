import { createBookingValidation } from '../../validators/booking.validator.js';

describe('Booking Validator', () => {
  test('should validate correct booking data', () => {
    const validBooking = {
      spaceId: '507f1f77bcf86cd799439011',
      startTime: '2024-01-20T10:00:00.000Z',
      endTime: '2024-01-20T12:00:00.000Z'
    };

    // This will FAIL initially (expected in TDD)
    const { error, value } = createBookingValidation.validate(validBooking);
    expect(error).toBeUndefined();
    expect(value).toEqual(validBooking);
  });

  test('should reject booking with missing spaceId', () => {
    const invalidBooking = {
      startTime: '2024-01-20T10:00:00.000Z',
      endTime: '2024-01-20T12:00:00.000Z'
    };

    const { error } = createBookingValidation.validate(invalidBooking);
    expect(error).toBeDefined();
    expect(error.details[0].message).toContain('spaceId');
  });
});