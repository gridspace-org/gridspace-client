import Joi from 'joi';

export const initializePaymentValidation = Joi.object({
  bookingId: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid booking ID format',
    'string.length': 'Invalid booking ID length',
    'any.required': 'Booking ID is required'
  })
});
