# Rollback Procedures - GridSpace Architecture Refactor

> **Emergency procedures for quickly reverting changes if needed**

---

## 🚨 Emergency Rollback Scenarios

### Scenario 1: Critical Bug in Production
**Symptoms**: Users cannot make bookings, service is down, or data corruption detected.

### Scenario 2: Performance Degradation
**Symptoms**: API response times > 5 seconds, database queries slow, memory leaks.

### Scenario 3: Integration Issues
**Symptoms**: Monnify payments failing, webhook processing broken, third-party API errors.

---

## ⚡ Fast Rollback Strategy (5 minutes)

### Step 1: Immediate Traffic Cut-off
```bash
# Disable new endpoints temporarily
# Comment out new routes in main route files

# In app.js or server.js, temporarily disable new routes:
// router.use('/api/v1/bookings', require('./routes/newBookingRoutes'));
// router.use('/api/v1/spaces', require('./routes/newSpaceRoutes'));

# Enable old routes (if backed up)
// router.use('/api/v1/bookings', require('./routes/legacyBookingRoutes'));
```

### Step 2: Database Connection Check
```bash
# Verify database is accessible
node -e "require('./config/mongoose').connectDB(); console.log('DB Connected');"

# Check for any failed transactions
mongosh --eval "db.bookings.find({status: 'processing'}).count()"
```

### Step 3: Service Status Check
```bash
# Restart services with old configuration
pm2 restart all --update-env

# Or for development
npm run dev
```

**Total Rollback Time: ~3-5 minutes**

---

## 🔄 Detailed Rollback Procedures

### Pre-Rollback Assessment

#### 1. Identify Scope of Issues
```bash
# Check error logs
tail -f logs/error.log | grep -i "booking\|space"

# Check performance metrics
curl -s http://localhost:3000/health | jq '.responseTime'

# Check database performance
mongosh --eval "db.bookings.find().explain('executionStats')"
```

#### 2. Decision Matrix
| Issue Type | Rollback Type | Time Estimate |
|------------|---------------|---------------|
| Data corruption | Full rollback | 30-60 min |
| Performance issues | Route-level rollback | 5-10 min |
| Single endpoint bug | Code rollback | 10-15 min |
| Integration failure | Service rollback | 15-30 min |

---

## 🛠️ Rollback Methods

### Method 1: Route-Level Rollback (Safest)
**When**: Single endpoint or module is broken, rest is working.

```javascript
// 1. Temporarily disable problematic routes
// routes/api.js
- const { createBooking } = require('../controllers/bookings/createBooking.controller');
+ // const { createBooking } = require('../controllers/bookings/createBooking.controller'); // TEMPORARILY DISABLED

- router.post('/bookings', protect, validateBookingCreation, createBooking);
+ // router.post('/bookings', protect, validateBookingCreation, createBooking); // TEMPORARILY DISABLED

// 2. Add fallback message
router.post('/bookings', (req, res) => {
  res.status(503).json({
    success: false,
    error: {
      code: 'SERVICE_UNAVAILABLE',
      message: 'Booking service temporarily unavailable. Please try again later.'
    }
  });
});
```

**Advantages**:
- ✅ Quick (5 minutes)
- ✅ No data loss
- ✅ Easy to restore
- ✅ Minimal disruption

**Disadvantages**:
- ❌ Feature temporarily unavailable
- ❌ Requires code changes

### Method 2: Full Code Rollback (Safe)
**When**: Multiple systems affected or unclear issue scope.

```bash
# 1. Backup current state (for analysis)
git stash

# 2. Rollback to previous working commit
git reset --hard HEAD~1

# 3. Restart services
pm2 restart all

# Or for development
npm run dev
```

**Advantages**:
- ✅ Complete system restoration
- ✅ No partial state issues
- ✅ Clean rollback point

**Disadvantages**:
- ❌ All new features temporarily lost
- ❌ May need database migration rollback

### Method 3: Database Rollback (Last Resort)
**When**: Data corruption or migration issues.

```bash
# 1. Stop application
pm2 stop all

# 2. Restore database from backup
mongorestore --host localhost --db gridspace ./backups/gridspace-pre-refactor/

# 3. Rollback code if needed
git reset --hard HEAD~1

# 4. Restart application
pm2 start all
```

**Advantages**:
- ✅ Complete data restoration
- ✅ Clean slate approach

**Disadvantages**:
- ❌ High risk of data loss
- ❌ Long rollback time
- ❌ Requires recent backups

---

## 🔍 Specific Rollback Scenarios

### Scenario A: Booking Creation Failing
**Symptoms**: 500 errors on POST /api/v1/bookings

**Rollback Steps**:
```bash
# 1. Disable booking creation endpoint
# routes/booking.routes.js
- router.post('/', protect, validateBookingCreation, createBooking);
+ // router.post('/', protect, validateBookingCreation, createBooking); // DISABLED FOR ROLLBACK

# 2. Add maintenance message
router.post('/', (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Booking creation temporarily unavailable'
  });
});

# 3. Restart server
pm2 restart server
```

### Scenario B: Database Performance Issues
**Symptoms**: Slow queries, connection timeouts

**Rollback Steps**:
```bash
# 1. Check database indexes
mongosh gridspace --eval "db.bookings.getIndexes()"

# 2. Temporarily disable problematic indexes (if any were added)
mongosh gridspace --eval "db.bookings.dropIndex('problematic_index_name')"

# 3. Restart with optimized queries
pm2 restart server
```

### Scenario C: Authentication Issues
**Symptoms**: JWT middleware failing, user lookup errors

**Rollback Steps**:
```bash
# 1. Temporarily use legacy auth middleware
# middleware/auth.js
- const { protect } = require('../middleware/newAuth');
+ const { protect } = require('../middleware/legacyAuth');

# 2. Restart services
pm2 restart server
```

### Scenario D: Service Layer Issues
**Symptoms**: Business logic errors, service timeouts

**Rollback Steps**:
```bash
# 1. Temporarily bypass service layer
# controllers/bookings/createBooking.controller.js
- const booking = await createBookingService(req.body);
+ // const booking = await createBookingService(req.body); // BYPASSED FOR ROLLBACK
+ const booking = await createBookingLegacy(req.body); // Use legacy method

# 2. Ensure legacy method exists or handle directly
```

---

## 🔄 Restoration Procedures

### After Issue Resolution

#### 1. Code Restoration
```bash
# 1. Update to latest stable version
git pull origin main

# 2. Restore stashed changes
git stash pop

# 3. Test locally first
npm run dev

# 4. Deploy gradually
```

#### 2. Database Migration (if needed)
```bash
# Only if database structure changed
npm run migrate:rollback
npm run migrate:latest
```

#### 3. Feature Re-enabling
```javascript
// Gradually re-enable features
// 1. Enable read-only features first (GET endpoints)
// 2. Then enable write features (POST, PUT, DELETE)
// 3. Monitor for issues at each step
```

---

## 📊 Monitoring During Rollback

### Health Checks
```bash
# Monitor during rollback process
while true; do
  echo "Checking health..."
  curl -s http://localhost:3000/health | jq '.status'
  sleep 5
done
```

### Error Rate Monitoring
```bash
# Monitor error rates
tail -f logs/error.log | grep -c "ERROR" &
```

### Database Connection Monitoring
```bash
# Monitor database connections
mongosh --eval "db.adminCommand({connPoolStats: 1})"
```

---

## 📋 Rollback Checklist

### Pre-Rollback
- [ ] Identify issue scope and type
- [ ] Choose appropriate rollback method
- [ ] Backup current state
- [ ] Notify team/ stakeholders
- [ ] Prepare monitoring tools

### During Rollback
- [ ] Execute rollback steps in order
- [ ] Monitor service health
- [ ] Verify database connectivity
- [ ] Test critical endpoints
- [ ] Document timeline and actions

### Post-Rollback
- [ ] Verify all services operational
- [ ] Test key user workflows
- [ ] Review logs for residual issues
- [ ] Analyze root cause
- [ ] Plan prevention measures
- [ ] Update this document with lessons learned

---

## 🎯 Prevention Strategies

### 1. Gradual Deployment
```javascript
// Feature flags for gradual rollout
const FEATURE_FLAGS = {
  NEW_BOOKING_SERVICE: process.env.ENABLE_NEW_BOOKING_SERVICE === 'true',
  NEW_SPACE_SERVICE: process.env.ENABLE_NEW_SPACE_SERVICE === 'true'
};

// Usage in routes
if (FEATURE_FLAGS.NEW_BOOKING_SERVICE) {
  router.post('/bookings', newCreateBooking);
} else {
  router.post('/bookings', legacyCreateBooking);
}
```

### 2. Blue-Green Deployment
```bash
# Keep old and new versions running simultaneously
# Switch traffic gradually
nginx -s reload  # Switch to new version
```

### 3. Canary Releases
```javascript
// Route percentage of traffic to new service
const canaryPercentage = parseInt(process.env.CANARY_PERCENTAGE) || 10;

if (Math.random() * 100 < canaryPercentage) {
  // Use new service
  return newBookingService.create(req.body);
} else {
  // Use legacy service
  return legacyBookingService.create(req.body);
}
```

### 4. Health Checks
```javascript
// Comprehensive health checks
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    bookingService: await checkBookingService(),
    spaceService: await checkSpaceService(),
    externalAPIs: await checkExternalAPIs()
  };
  
  const allHealthy = Object.values(checks).every(check => check.healthy);
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  });
});
```

---

## 📞 Emergency Contacts & Escalation

### Internal Team
- **Lead Developer**: [Contact Info]
- **DevOps Engineer**: [Contact Info]
- **Product Owner**: [Contact Info]

### External Services
- **Database Support**: MongoDB Atlas Support
- **Hosting Provider**: AWS/GCP Support
- **Third-party APIs**: Monnify Support

### Escalation Timeline
- **0-5 minutes**: Internal team notification
- **5-15 minutes**: Stakeholder notification if critical
- **15-30 minutes**: External support engagement
- **30+ minutes**: Executive escalation

---

## 📈 Lessons Learned Template

After each rollback, document:

```markdown
## Rollback Incident Report - [Date]

### Issue Summary
- **Problem**: 
- **Impact**: 
- **Affected Users**: 
- **Detection Time**: 
- **Resolution Time**: 

### Root Cause Analysis
- **Primary Cause**: 
- **Contributing Factors**: 
- **Why Previous Testing Missed This**: 

### Actions Taken
1. 
2. 
3. 

### Prevention Measures
1. 
2. 
3. 

### Timeline
- **Issue Detected**: 
- **Rollback Started**: 
- **Rollback Completed**: 
- **Service Restored**: 

### Cost Impact
- **Downtime**: 
- **Revenue Impact**: 
- **Development Time**: 
```

---

## 🚀 Success Metrics for Rollback Procedures

- **Rollback Time**: < 5 minutes for route-level, < 30 minutes for full rollback
- **Data Loss**: 0% - No user data should be lost
- **Service Availability**: > 99% uptime maintained
- **User Impact**: Minimal - Users should experience brief service interruption only

---

**Remember**: The goal of rollback procedures is to restore service quickly and safely while preserving user data and system integrity. Choose the least disruptive method that will resolve the issue effectively.