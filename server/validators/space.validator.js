import Joi from 'joi';

export const createSpaceValidation = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    'string.min': 'Title must be at least 5 characters long',
    'string.max': 'Title cannot exceed 100 characters',
    'any.required': 'Title is required'
  }),
  
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Description is required'
  }),
  
  location: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Location must be at least 3 characters long',
    'any.required': 'Location is required'
  }),
  
  address: Joi.string().max(300).optional(),
  
  pricePerHour: Joi.number().min(500).max(50000).required().messages({
    'number.min': 'Price per hour must be at least ₦500',
    'number.max': 'Price per hour cannot exceed ₦50,000',
    'any.required': 'Price per hour is required'
  }),
  
  capacity: Joi.number().min(1).max(100).required().messages({
    'number.min': 'Capacity must be at least 1 person',
    'number.max': 'Capacity cannot exceed 100 people',
    'any.required': 'Capacity is required'
  }),
  
  amenities: Joi.array().items(
    Joi.string().valid(
      'WiFi', 'Projector', 'Whiteboard', 'Air Conditioning', 
      'Power Backup', 'Parking', 'Coffee/Tea', 'Printer/Scanner',
      'Conference Phone', 'Monitor', 'Kitchen', 'Restroom'
    )
  ).max(12).optional(),
  
  purposes: Joi.array().items(
    Joi.string().valid(
      'Remote Work', 'Study Session', 'Team Meetings', 
      'Networking', 'Presentations', 'Creative Work',
      'Interview', 'Training', 'Client Meeting'
    )
  ).max(6).optional()
});

export const updateSpaceValidation = createSpaceValidation.fork(
  ['title', 'description', 'location', 'pricePerHour', 'capacity'],
  (schema) => schema.optional()
);

export const searchSpacesValidation = Joi.object({
  location: Joi.string().min(2).max(100).optional(),
  priceMin: Joi.number().min(0).max(50000).optional(),
  priceMax: Joi.number().min(0).max(50000).optional(),
  capacity: Joi.number().min(1).max(100).optional(),
  purposes: Joi.array().items(Joi.string()).optional(),
  amenities: Joi.array().items(Joi.string()).optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(12),
  sortBy: Joi.string().valid(
    'price_low_high', 'price_high_low', 'rating', 'newest', 'most_popular'
  ).default('newest')
});