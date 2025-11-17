# Developer Onboarding Guide - GridSpace Refactored Architecture

> **Welcome to the new enterprise-grade GridSpace server architecture!**

---

## 🎯 Quick Start Guide

### 1. Architecture Overview
Your GridSpace server now follows a **clean, layered architecture**:
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Repositories**: Handle database operations
- **DTOs**: Format responses consistently

### 2. Directory Structure
```
server/
├── controllers/          # HTTP request handlers
│   ├── bookings/        # Booking endpoints
│   └── spaces/          # Space endpoints
├── services/            # Business logic
│   ├── bookings/        # Booking business logic
│   └── spaces/          # Space business logic
├── repositories/        # Database operations
├── utils/               # Shared utilities
│   ├── dto/            # Response formatters
│   ├── logger.js       # Structured logging
│   └── errorHandler.js # Error handling
├── config/             # Business constants
└── middleware/         # Shared middleware
```

---

## 📝 Core Concepts

### Controller Pattern
**Controllers should be thin and focused on HTTP concerns only:**

```javascript
// ❌ OLD: Controller with business logic
exports.createBooking = async (req, res) => {
  const { spaceId, startTime, endTime } = req.body;
  
  // ❌ Business logic in controller
  const conflict = await Booking.findOne({
    spaceId,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });
  
  if (conflict) {
    return res.status(409).json({ error: 'Time conflict' });
  }
  
  // ❌ Direct database operation
  const booking = new Booking({ ... });
  await booking.save();
  
  res.status(201).json(booking);
};

// ✅ NEW: Controller delegates to service
exports.createBooking = async (req, res, next) => {
  try {
    const booking = await createBookingService({
      ...req.body,
      userId: req.user._id
    });
    
    res.status(201).json(formatBookingResponse(booking));
  } catch (error) {
    next(error);
  }
};
```

### Service Pattern
**Services contain all business logic and validation:**

```javascript
// ✅ services/bookings/booking.service.js
const bookingRepository = new BookingRepository();

class BookingService {
  async createBooking(bookingData) {
    // ✅ Business logic validation
    this.validateBookingData(bookingData);
    
    // ✅ Conflict detection
    const conflicts = await bookingRepository.findConflicts({
      spaceId: bookingData.spaceId,
      startTime: bookingData.startTime,
      endTime: bookingData.endTime
    });
    
    if (conflicts.length > 0) {
      throw new AppError('Time slot already booked', 409, 'BOOKING_CONFLICT');
    }
    
    // ✅ Create booking through repository
    return bookingRepository.create({
      ...bookingData,
      status: BOOKING_STATUS.PENDING
    });
  }
}
```

### Repository Pattern
**Repositories handle all database operations:**

```javascript
// ✅ repositories/booking.repository.js
class BookingRepository {
  async create(bookingData) {
    const booking = new Booking(bookingData);
    return booking.save();
  }
  
  async findConflicts(query) {
    return Booking.find(query)
      .where('status')
      .nin([BOOKING_STATUS.CANCELLED])
      .lean();
  }
  
  async findByUser(userId, options = {}) {
    return Booking.find({ userId })
      .sort(options.sort || { createdAt: -1 })
      .skip(options.skip || 0)
      .limit(options.limit || 10)
      .populate('spaceId', 'title location pricePerHour')
      .lean();
  }
}
```

---

## 🔧 Development Workflow

### Adding a New Endpoint

#### 1. Create Repository Method (if needed)
```javascript
// repositories/booking.repository.js
async findByDateRange(startDate, endDate) {
  return Booking.find({
    startTime: { $gte: startDate },
    endTime: { $lte: endDate }
  }).lean();
}
```

#### 2. Create/Update Service Method
```javascript
// services/bookings/booking.service.js
async getBookingsByDateRange(startDate, endDate, userId) {
  // ✅ Business logic here
  const bookings = await bookingRepository.findByDateRange(startDate, endDate);
  
  // ✅ Filter by user if specified
  if (userId) {
    return bookings.filter(booking => booking.userId.toString() === userId);
  }
  
  return bookings;
}
```

#### 3. Create Controller
```javascript
// controllers/bookings/getBookingsByDate.controller.js
const { getBookingsByDateRange } = require('../../services/bookings/booking.service');
const { formatBookingsResponse } = require('../../utils/dto/booking.dto');
const { asyncHandler } = require('../../utils/errorHandler');

exports.getBookingsByDate = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const { userId } = req.user;
  
  const bookings = await getBookingsByDateRange(
    new Date(startDate),
    new Date(endDate),
    userId
  );
  
  res.json(formatBookingsResponse(bookings));
});
```

#### 4. Add DTO Formatter (if needed)
```javascript
// utils/dto/booking.dto.js
exports.formatBookingsByDateResponse = (bookings) => ({
  success: true,
  message: 'Bookings retrieved successfully',
  data: bookings.map(formatBookingResponse),
  timestamp: new Date().toISOString()
});
```

#### 5. Add Validation
```javascript
// middleware/sharedValidation.js
export const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return next(new AppError('Start date and end date are required', 400));
  }
  
  if (new Date(startDate) >= new Date(endDate)) {
    return next(new AppError('Start date must be before end date', 400));
  }
  
  next();
};
```

#### 6. Add Routes
```javascript
// routes/booking.routes.js
router.get('/bookings/date-range',
  protect,
  validateDateRange,
  getBookingsByDate
);
```

#### 7. Add Tests
```javascript
// test/unit/services/booking.service.test.js
describe('BookingService.getBookingsByDateRange', () => {
  it('should return bookings within date range', async () => {
    const result = await bookingService.getBookingsByDateRange(
      new Date('2025-01-01'),
      new Date('2025-01-31')
    );
    expect(result).toBeInstanceOf(Array);
  });
});
```

---

## 🛠️ Common Patterns

### Error Handling
```javascript
// ✅ Use asyncHandler wrapper
exports.createBooking = asyncHandler(async (req, res, next) => {
  const booking = await createBookingService(req.body);
  res.status(201).json(formatBookingResponse(booking));
});

// ✅ Services use catchAsync
class BookingService {
  async createBooking = catchAsync(async (bookingData) => {
    // Business logic here
  });
}
```

### Validation
```javascript
// ✅ Use centralized validation
router.post('/bookings',
  validateBookingCreation,
  validateObjectId('spaceId'),
  createBooking
);

// ✅ Custom validation in services
class BookingService {
  validateBookingData(data) {
    if (!data.spaceId || !data.startTime || !data.endTime) {
      throw new AppError('Missing required fields', 400);
    }
    
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      throw new AppError('Start time must be before end time', 400);
    }
  }
}
```

### Logging
```javascript
// ✅ Always use structured logging
const logger = require('../utils/logger');

exports.createBooking = asyncHandler(async (req, res) => {
  logger.info('Creating new booking', {
    event: 'booking_create_start',
    userId: req.user._id,
    spaceId: req.body.spaceId,
    correlationId: req.correlationId
  });
  
  const booking = await createBookingService(req.body);
  
  logger.info('Booking created successfully', {
    event: 'booking_created',
    bookingId: booking._id,
    userId: req.user._id,
    correlationId: req.correlationId
  });
  
  res.status(201).json(formatBookingResponse(booking));
});
```

### Response Formatting
```javascript
// ✅ Always use DTO formatters
const { formatBookingResponse, formatBookingListResponse } = require('../utils/dto/booking.dto');

// Single booking
res.status(201).json(formatBookingResponse(booking));

// Multiple bookings with pagination
res.json(formatBookingListResponse(bookings, pagination));
```

---

## 📊 Business Rules

### Status Transitions
All status transitions are centralized in `config/statuses.js`:

```javascript
// ✅ Check valid transitions
const validTransitions = BOOKING_STATUS_TRANSITIONS[currentStatus];
if (!validTransitions.includes(newStatus)) {
  throw new AppError(
    `Cannot transition from ${currentStatus} to ${newStatus}`,
    400,
    'INVALID_STATUS_TRANSITION'
  );
}
```

### Refund Calculations
```javascript
// ✅ Use centralized refund logic
const refundAmount = this.calculateRefund(booking, cancellationTime);

calculateRefund(booking, cancellationTime) {
  const hoursUntilStart = (booking.startTime - cancellationTime) / (1000 * 60 * 60);
  
  if (hoursUntilStart > REFUND_POLICY.FULL_REFUND_HOURS) {
    return booking.totalAmount; // Full refund
  } else if (hoursUntilStart > REFUND_POLICY.PARTIAL_REFUND_HOURS) {
    return Math.floor(booking.totalAmount * 0.5); // 50% refund
  }
  
  return 0; // No refund
}
```

### Validation Rules
```javascript
// ✅ Use centralized constraints
if (pricePerHour < SPACE_CONSTRAINTS.MIN_PRICE_PER_HOUR) {
  throw new AppError(
    `Price must be at least ₦${SPACE_CONSTRAINTS.MIN_PRICE_PER_HOUR}`,
    400
  );
}
```

---

## 🚀 Best Practices

### 1. Controller Guidelines
- ✅ **Keep controllers < 150 lines**
- ✅ **Use asyncHandler for all async operations**
- ✅ **Delegate all business logic to services**
- ✅ **Use DTO formatters for responses**
- ✅ **Always include correlation IDs in logs**

### 2. Service Guidelines
- ✅ **One service per domain (booking, space, payment)**
- ✅ **Use catchAsync for async operations**
- ✅ **Validate all input data**
- ✅ **Handle business rule violations with AppError**
- ✅ **Log all operations with context**

### 3. Repository Guidelines
- ✅ **One repository per model**
- ✅ **Return plain objects with .lean() when possible**
- ✅ **Use proper indexes for queries**
- ✅ **Handle database errors gracefully**
- ✅ **Keep queries simple and focused**

### 4. DTO Guidelines
- ✅ **One DTO formatter per response type**
- ✅ **Consistent response structure across endpoints**
- ✅ **Sanitize sensitive data**
- ✅ **Include timestamps in responses**
- ✅ **Use descriptive field names**

---

## 🧪 Testing Strategy

### Unit Tests (Services & Repositories)
```javascript
// ✅ Test business logic independently
describe('BookingService', () => {
  describe('createBooking', () => {
    it('should detect time conflicts', async () => {
      // Mock repository to return conflict
      bookingRepository.findConflicts.mockResolvedValue([conflictBooking]);
      
      await expect(
        bookingService.createBooking(bookingData)
      ).rejects.toThrow('BOOKING_CONFLICT');
    });
  });
});
```

### Integration Tests (Controllers)
```javascript
// ✅ Test HTTP endpoints
describe('POST /api/v1/bookings', () => {
  it('should create booking successfully', async () => {
    const response = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send(validBookingData);
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('_id');
  });
});
```

---

## 🔍 Debugging & Troubleshooting

### Enable Debug Logging
```javascript
// Set environment variable
DEBUG=gridspace:*

// Or in code
process.env.NODE_ENV = 'development';
```

### Check Correlation IDs
```javascript
// All logs include correlation ID for request tracing
logger.info('Operation completed', {
  correlationId: req.correlationId,
  userId: req.user._id
});
```

### Common Error Patterns
```javascript
// ✅ Booking conflicts
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "Time slot already booked",
    "details": {
      "conflictingBookingId": "507f1f77bcf86cd799439011"
    }
  }
}

// ✅ Validation errors
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "validationErrors": [
        {
          "field": "startTime",
          "message": "Start time must be in the future"
        }
      ]
    }
  }
}
```

---

## 🚀 Monnify Integration Guide

### Payment Service Structure
```javascript
// services/payments/monnify.service.js
class MonnifyPaymentService {
  async initializePayment(bookingId, amount) {
    // Integration with Monnify API
  }
  
  async verifyPayment(reference) {
    // Verify payment status
  }
  
  async processRefund(bookingId, amount) {
    // Handle refunds
  }
}
```

### Integration Points
```javascript
// In booking.service.js
const paymentService = new MonnifyPaymentService();

async createBooking(bookingData) {
  // ✅ Create booking
  const booking = await bookingRepository.create(bookingData);
  
  // ✅ Initialize payment
  const payment = await paymentService.initializePayment(
    booking._id,
    booking.totalAmount
  );
  
  // ✅ Update booking with payment reference
  await bookingRepository.update(booking._id, {
    paymentReference: payment.reference
  });
  
  return booking;
}
```

---

## 📋 Pre-Deployment Checklist

- [ ] All controllers use services → repositories pattern
- [ ] No direct Mongoose queries in controllers
- [ ] All responses use DTO formatters
- [ ] All errors handled through errorHandler
- [ ] All operations logged with correlation IDs
- [ ] Business rules centralized in config/statuses.js
- [ ] Unit tests for all service methods
- [ ] Integration tests for all endpoints
- [ ] API documentation updated
- [ ] Database indexes optimized
- [ ] Environment variables configured
- [ ] Logging levels configured
- [ ] Error monitoring setup
- [ ] Performance monitoring setup

---

## 🎯 Success Metrics

### Code Quality
- ✅ **Controller Size**: All < 150 lines
- ✅ **Service Coverage**: 100% business logic in services
- ✅ **Repository Usage**: 100% database access through repositories
- ✅ **Error Handling**: 100% errors through errorHandler
- ✅ **Response Consistency**: 100% responses through DTOs

### Architecture Compliance
- ✅ **Layer Separation**: Clear boundaries between layers
- ✅ **Single Responsibility**: Each module has one reason to change
- ✅ **Dependency Inversion**: Controllers depend on abstractions
- ✅ **Open/Closed**: New features without modifying existing code

---

## 🚦 Next Steps

1. **Review the API Documentation** (`API_DOCUMENTATION_REFACTORED.md`)
2. **Study the Code Examples** in this guide
3. **Run the Integration Tests** to verify everything works
4. **Practice with a Simple Feature** following the patterns
5. **Integrate Monnify Payments** using the clean service layer

**Welcome to enterprise-grade development!** 🚀

---

## 📞 Support

- **Architecture Questions**: Review `server/docs/refactor-architecture-plan.md`
- **API Questions**: Check `server/API_DOCUMENTATION_REFACTORED.md`
- **Implementation Questions**: Refer to the patterns in this guide
- **Testing Questions**: Look at existing tests in `test/` directory
- **Monnify Integration**: Follow the patterns in `services/payments/`

**Happy coding!** 💻