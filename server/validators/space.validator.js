import Joi from "joi";

export const createSpaceValidation = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot exceed 100 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 1000 characters",
    "any.required": "Description is required",
  }),

  location: Joi.string().min(3).max(200).required().messages({
    "string.min": "Location must be at least 3 characters long",
    "any.required": "Location is required",
  }),

  address: Joi.string().max(300).optional(),

  pricePerHour: Joi.number().min(500).max(50000).required().messages({
    "number.min": "Price per hour must be at least ₦500",
    "number.max": "Price per hour cannot exceed ₦50,000",
    "any.required": "Price per hour is required",
  }),

  pricePerDay: Joi.number().min(2000).max(200000).optional().messages({
    "number.min": "Price per day must be at least ₦2,000",
    "number.max": "Price per day cannot exceed ₦200,000",
  }),

  pricePerWeek: Joi.number().min(10000).max(1000000).optional().messages({
    "number.min": "Price per week must be at least ₦10,000",
    "number.max": "Price per week cannot exceed ₦1,000,000",
  }),

  pricePerMonth: Joi.number().min(30000).max(3000000).optional().messages({
    "number.min": "Price per month must be at least ₦30,000",
    "number.max": "Price per month cannot exceed ₦3,000,000",
  }),

  availableBookingTypes: Joi.array()
    .items(Joi.string().valid("hourly", "daily", "weekly", "monthly"))
    .min(1)
    .optional()
    .messages({
      "array.min": "At least one booking type must be specified",
    }),

  capacity: Joi.number().min(1).max(100).required().messages({
    "number.min": "Capacity must be at least 1 person",
    "number.max": "Capacity cannot exceed 100 people",
    "any.required": "Capacity is required",
  }),

  amenities: Joi.array()
    .items(
      Joi.string().valid(
        "WiFi",
        "Projector",
        "Whiteboard",
        "Air Conditioning",
        "Power Backup",
        "Parking",
        "Coffee/Tea",
        "Printer/Scanner",
        "Conference Phone",
        "Monitor",
        "Kitchen",
        "Restroom"
      )
    )
    .max(12)
    .optional(),

  purposes: Joi.array()
    .items(
      Joi.string().valid(
        "Remote Work",
        "Study Session",
        "Team Meetings",
        "Networking",
        "Presentations",
        "Creative Work",
        "Interview",
        "Training",
        "Client Meeting"
      )
    )
    .max(6)
    .optional(),

  timeSlots: Joi.array().items(
    Joi.object({
      day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
      startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
      endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required()
    })
  ).min(1).optional(),
  
  images: Joi.array().items(Joi.string()).max(5).optional().messages({
    'array.max': 'Cannot upload more than 5 images'
  })
});

export const updateSpaceValidation = createSpaceValidation.fork(
  ['title', 'description', 'location', 'pricePerHour', 'pricePerDay', 'pricePerWeek', 'capacity'],
  (schema) => schema.optional()
);

export const searchSpacesValidation = Joi.object({
  location: Joi.string().min(2).max(100).optional(),
  priceMin: Joi.number().min(0).max(50000).optional(),
  priceMax: Joi.number().min(0).max(50000).optional(),
  capacity: Joi.number().min(1).max(100).optional(),
  purposes: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()),
      Joi.string().custom((value, helpers) => {
        // Convert comma-separated string to array
        return value.split(',').map(v => v.trim()).filter(Boolean);
      })
    )
    .optional(),
  amenities: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string()),
      Joi.string().custom((value, helpers) => {
        // Convert comma-separated string to array
        return value.split(',').map(v => v.trim()).filter(Boolean);
      })
    )
    .optional(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(50).default(12),
  sortBy: Joi.string()
    .valid(
      "price_low_high",
      "price_high_low",
      "rating",
      "newest",
      "most_popular"
    )
    .default("newest"),
});
