# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in GridSpace, please report it responsibly:

1. **DO NOT** open a public GitHub issue
2. Email security concerns to: [security@gridspace.com.ng] (replace with actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and provide updates every 72 hours until resolved.

## Security Measures

### Authentication
- JWT tokens stored in httpOnly cookies
- Secure flag enabled in production
- Token expiration: 15 minutes (access), 7 days (refresh)
- Password hashing with bcrypt (cost factor: 10)

### Input Validation
- Joi validation on all endpoints
- NoSQL injection protection
- XSS prevention via sanitization
- File upload restrictions (5MB, images only)

### Rate Limiting
- Login attempts: 5 per 15 minutes
- Signup: 10 per minute
- Booking creation: 3 per 15 minutes
- API searches: 60 per minute

### Logging & Monitoring
- PII redaction in all logs
- Security event logging
- Admin action audit trail
- 30-day log retention

### Infrastructure
- HTTPS enforced in production
- Security headers via Helmet
- CORS whitelist configuration
- Database connection encryption

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Security Updates

Security patches are released as needed. Subscribe to repository notifications for alerts.

## Best Practices for Developers

1. Never commit `.env` files
2. Use environment variables for secrets
3. Run `npm audit` before deploying
4. Keep dependencies updated
5. Follow the security checklist in `docs/security-checklist.md`

## Compliance

- OWASP Top 10 coverage: 95%
- Regular security audits
- Automated dependency scanning
- PII protection measures

## Contact

For security questions: [security@gridspace.com.ng]  
For general support: [support@gridspace.com.ng]
