# MailerSend Setup Guide

This guide will help you set up MailerSend for email OTP verification in your GridSpace application.

## Prerequisites

1. A MailerSend account (sign up at [mailersend.com](https://www.mailersend.com))
2. A verified domain in MailerSend
3. Node.js and npm installed

## Installation

1. Install the MailerSend package:
```bash
npm install mailersend
```

## Configuration

### 1. Get Your MailerSend API Key

1. Log in to your MailerSend dashboard
2. Go to **Settings** > **API Tokens**
3. Create a new API token with the following permissions:
   - `email:send` - Send emails
   - `email:read` - Read email status
4. Copy the generated API token

### 2. Set Up Your Domain

1. In MailerSend dashboard, go to **Domains**
2. Add your domain (e.g., `yourdomain.com`)
3. Verify your domain by adding the required DNS records
4. Wait for domain verification to complete

### 3. Configure Environment Variables

Add the following variables to your `.env` file:

```env
# MailerSend Configuration
MAILERSEND_API_KEY=your_mailersend_api_key_here
MAILERSEND_FROM_EMAIL=noreply@yourdomain.com
MAILERSEND_FROM_NAME=GridSpace
```

**Important Notes:**
- Replace `your_mailersend_api_key_here` with your actual API key
- Replace `noreply@yourdomain.com` with an email address from your verified domain
- The `MAILERSEND_FROM_NAME` can be customized to your application name

### 4. Test Your Configuration

You can test your MailerSend configuration by making a request to the email verification endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/request-email-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Features Implemented

### Email Verification with OTP

- **6-digit OTP**: Secure, easy-to-enter verification codes
- **10-minute expiry**: Short expiration time for security
- **3 attempts limit**: Prevents brute force attacks
- **Beautiful email templates**: Professional HTML and text email templates
- **Automatic cleanup**: Expired OTPs are automatically removed

### Password Reset Emails

- **Secure reset links**: Time-limited password reset URLs
- **Professional templates**: Branded email templates
- **1-hour expiry**: Reasonable time window for password reset

### API Endpoints

#### Request Email Verification
```
POST /api/auth/request-email-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Email with OTP
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Resend Email Verification
```
POST /api/auth/resend-email-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Email Templates

The application includes professionally designed email templates:

### OTP Verification Email
- Clean, modern design
- Clear OTP display with large, readable font
- Security warnings and instructions
- Responsive design for mobile devices

### Password Reset Email
- Branded design consistent with your application
- Clear call-to-action button
- Security information and expiry notice
- Fallback text link for accessibility

## Security Features

1. **Rate Limiting**: Maximum 3 OTP attempts per email
2. **Short Expiry**: OTPs expire in 10 minutes
3. **Automatic Cleanup**: Expired records are automatically removed
4. **Secure Generation**: Cryptographically secure OTP generation
5. **Email Validation**: Proper email format validation

## Troubleshooting

### Common Issues

1. **"Failed to send verification email"**
   - Check your MailerSend API key
   - Verify your domain is properly set up
   - Ensure your from email is from a verified domain

2. **"Invalid API key"**
   - Verify your API key is correct
   - Check that the API key has the required permissions

3. **"Domain not verified"**
   - Complete the domain verification process in MailerSend
   - Wait for DNS propagation (can take up to 24 hours)

4. **Emails going to spam**
   - Set up SPF, DKIM, and DMARC records for your domain
   - Use a reputable domain for sending emails
   - Avoid spam trigger words in email content

### Testing in Development

For development and testing, you can:

1. Use MailerSend's sandbox mode
2. Check the MailerSend dashboard for delivery status
3. Use test email addresses for verification

## Production Considerations

1. **Domain Reputation**: Use a dedicated domain for transactional emails
2. **Monitoring**: Set up monitoring for email delivery rates
3. **Backup Provider**: Consider having a backup email service
4. **Rate Limiting**: Implement additional rate limiting at the application level
5. **Logging**: Log email sending attempts for debugging

## Support

- MailerSend Documentation: [docs.mailersend.com](https://docs.mailersend.com)
- MailerSend Support: Available through their dashboard
- API Reference: [developers.mailersend.com](https://developers.mailersend.com)

## Cost Considerations

MailerSend offers:
- Free tier: 3,000 emails/month
- Pay-as-you-go pricing for higher volumes
- No setup fees or monthly commitments

Check their current pricing at [mailersend.com/pricing](https://www.mailersend.com/pricing)
