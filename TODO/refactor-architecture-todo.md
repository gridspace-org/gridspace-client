# GridSpace Server Architecture Refactor - TODO List

## Phase 0: Safety Nets - Create Integration Test Snapshots (1 day)
- [ ] Analyze current booking endpoints behavior
- [ ] Create integration tests for GET /api/v1/bookings/me (getUserBookings)
- [ ] Create integration tests for GET /api/v1/host/bookings (getHostBookings) 
- [ ] Create integration tests for PUT /api/v1/bookings/:id/status (updateBookingStatus)
- [ ] Create integration tests for DELETE /api/v1/bookings/:id (cancelBooking)
- [ ] Document current API response formats and payloads
- [ ] Set up test database and sample data for regression testing

## Phase 1: Booking Foundations (2-3 days) - Set up Layered Architecture
- [ ] Create folder structure: controllers/bookings/, services/bookings/, repositories/
- [ ] Create utils/dto/booking.dto.js with standardized response formatters
- [ ] Create repositories/booking.repository.js with CRUD operations
- [ ] Refactor getUserBookings to use DTO formatter and repository
- [ ] Refactor getHostBookings to use DTO formatter and repository
- [ ] Test non-mutating endpoints with integration tests
- [ ] Update existing booking.service.js to work with new repository layer

## Phase 2: Booking Mutations (2-3 days) - Extract Business Logic
- [ ] Create services/bookings/booking.service.js methods for business logic
- [ ] Extract createBooking flow: conflict checks, price calculation to service
- [ ] Extract updateBookingStatus flow: status transitions (lines 171-186) to service
- [ ] Extract cancelBooking flow: refund calculations (lines 298-311) to service
- [ ] Refactor updateBookingStatus controller to use new service methods
- [ ] Refactor cancelBooking controller to use new service methods
- [ ] Add unit tests for all new service methods
- [ ] Remove direct Mongoose queries from controllers
- [ ] Run integration tests to ensure no regressions

## Phase 3: Spaces Module Refactor (2-3 days) - Apply Same Pattern
- [ ] Analyze server/controllers/space.controller.js for similar issues
- [ ] Create controllers/spaces/, services/spaces/, repositories/spaces/
- [ ] Extract space search and filtering logic to service layer
- [ ] Create repositories/space.repository.js for database operations
- [ ] Refactor space controllers to use new layered architecture
- [ ] Add analytics logging to space service layer
- [ ] Test space endpoints with integration tests
- [ ] Ensure response formats are consistent

## Phase 4: Cross-Cutting Enhancements (1-2 days) - Standardization
- [ ] Create utils/logger.js to standardize logging patterns
- [ ] Extract constants to config/statuses.js (status transitions, refund rules)
- [ ] Update validation patterns to use centralized schemas
- [ ] Standardize error handling across all controllers
- [ ] Create shared validation middleware
- [ ] Update API documentation to reflect new architecture
- [ ] Add correlationId and userId to logging utility

## Phase 5: Pre-Payment Checklist (1 day) - Final Validation
- [ ] Verify all endpoints use services → repositories pattern
- [ ] Confirm response formats match Phase 0 snapshots
- [ ] Run full integration test suite
- [ ] Run lint and type checking
- [ ] Update API documentation with new controller structure
- [ ] Create developer onboarding guide for new architecture
- [ ] Document rollback procedures if needed
- [ ] Prepare for Monnify integration with clean service layer

## Post-Phase 5: Cross-Module Alignment (Future)
- [ ] Split controllers/admin.controller.js into AdminService + repository
- [ ] Introduce AuthService for user creation/login/logout flows
- [ ] Extract token refresh logic to shared utilities
- [ ] Complete layered structure for all remaining modules

---

## Current State Analysis Summary

### Booking Controller Issues (server/controllers/booking.controller.js)
- ~400 lines with mixed concerns in single file
- Partial service layer adoption (getUserBookings, getHostBookings use services, but createBooking, updateBookingStatus, cancelBooking don't)
- Direct Mongoose queries in controllers (lines 152, 207, 271)
- Business logic embedded in controllers (status transition rules, refund calculations)
- Inconsistent response formatting across methods
- Validation logic mixed with controller orchestration

### Key Line References
- Lines 38, 88: Methods that use services
- Lines 152, 207, 271: Direct Mongoose queries
- Lines 171-186: Status transition validation logic
- Lines 298-311: Refund calculation and timing rules
- Lines 192-205: Cancellation business rules and payment handling

### Target Architecture
```
server/
  controllers/
    bookings/
      createBooking.controller.js
      listBookings.controller.js
      updateStatus.controller.js
      index.js
  services/
    bookings/
      booking.service.js
  repositories/
    bookings.repo.js
  utils/
    dto/
      booking.dto.js
    logger.js
    responseFormatter.js
```

### Success Criteria
- Controllers <150 lines, focusing on orchestration only
- Services expose clearly named methods (e.g., BookingService.createBooking)
- Repository methods return plain objects / lean queries
- Integration tests green + API responses unchanged
- All business logic moved to service layer
- Consistent response formatting across all endpoints
---

## ⚠️ CRITICAL: Non-Breaking Changes Policy

**ZERO ENDPOINT CHANGES GUARANTEED**
- All existing API endpoints remain unchanged
- Same URLs, same request/response formats
- Only internal code structure improves
- Backward compatibility maintained at all times

**SAFE MIGRATION STRATEGY**
1. **Parallel Development**: New code added alongside existing code
2. **Gradual Switching**: Routes updated one endpoint at a time
3. **Rollback Ready**: Old code kept as fallback during transition
4. **Integration Tests**: Continuous verification of no regressions

**CURRENT AUTH MODULE COMPARISON**
Your current auth module structure:
```
server/controllers/auth/registration.controller.js (66 lines, mixed concerns)
```

**REFACTORED BOOKING WILL BE CLEANER**
```
server/controllers/bookings/
  ├── createBooking.controller.js (<150 lines)
  ├── listBookings.controller.js (<150 lines)  
  ├── updateBookingStatus.controller.js (<150 lines)
  ├── cancelBooking.controller.js (<150 lines)
  ├── index.js
server/services/bookings/booking.service.js (business logic only)
server/repositories/booking.repository.js (DB operations only)
server/utils/dto/booking.dto.js (response formatting only)
```

**WHAT STAYS THE SAME**
- ✅ All booking endpoints URLs
- ✅ All request/response formats
- ✅ All authentication requirements
- ✅ All business rules and logic
- ✅ All database operations
- ✅ All existing functionality

**WHAT IMPROVES**
- 🔧 Controllers become orchestration-only (<150 lines each)
- 🔧 Business logic separated into service layer
- 🔧 Database operations centralized in repositories
- 🔧 Response formatting standardized with DTOs
- 🔧 Code becomes more testable and maintainable
- 🔧 Ready for Monnify payment integration

**NO RISK APPROACH**
- Test each phase before moving to next
- Can stop at any phase if needed
- Old code remains as safety net
- Integration tests prevent regressions