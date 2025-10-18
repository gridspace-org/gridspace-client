# Nodemailer Setup Guide for GridSpace

This guide will help you configure nodemailer for email verification and password reset functionality.

## Prerequisites

- Node.js and npm installed
- A valid email account (Gmail, Outlook, or custom SMTP)

## Configuration Options

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. **Update your `.env` file**:

```env
# Gmail Configuration
SMTP_SERVICE=gmail
SMTP_USER=your-email@gmail.com
SMTP_APP_PASSWORD=your-16-character-app-password

# Email Settings
FROM_EMAIL=noreply@gridspace.com
FROM_NAME=GridSpace
FRONTEND_URL=http://localhost:3000
```

### Option 2: Outlook/Hotmail

1. **Update your `.env` file**:

```env
# Outlook Configuration
SMTP_SERVICE=outlook
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-outlook-password

# Email Settings
FROM_EMAIL=noreply@gridspace.com
FROM_NAME=GridSpace
FRONTEND_URL=http://localhost:3000
```

### Option 3: Custom SMTP Server

```env
# Custom SMTP Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-password

# Email Settings
FROM_EMAIL=noreply@gridspace.com
FROM_NAME=GridSpace
FRONTEND_URL=http://localhost:3000
```

## Testing the Configuration

1. **Run the test script**:
```bash
cd server
node test-nodemailer.js
```

2. **Check your email** for test messages

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SMTP_SERVICE` | Email service provider | No* | `gmail`, `outlook` |
| `SMTP_HOST` | SMTP server hostname | No* | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | No | `587` (default) |
| `SMTP_SECURE` | Use SSL/TLS | No | `true` for port 465, `false` for others |
| `SMTP_USER` | Your email address | Yes | `your-email@gmail.com` |
| `SMTP_PASS` | Your email password | No** | `your-password` |
| `SMTP_APP_PASSWORD` | Gmail app password | No** | `16-char-app-password` |
| `FROM_EMAIL` | Sender email address | Yes | `noreply@gridspace.com` |
| `FROM_NAME` | Sender name | Yes | `GridSpace` |
| `FRONTEND_URL` | Frontend application URL | Yes | `http://localhost:3000` |

*Either `SMTP_SERVICE` or `SMTP_HOST` is required
**Either `SMTP_PASS` or `SMTP_APP_PASSWORD` is required (use app password for Gmail)

## Common Issues and Solutions

### Gmail Issues

**Error: "Invalid login"**
- Make sure you're using an App Password, not your regular Gmail password
- Enable 2-Factor Authentication first

**Error: "Less secure app access"**
- Use App Passwords instead of enabling less secure apps
- App Passwords are more secure

### Outlook Issues

**Error: "Authentication failed"**
- Make sure your password is correct
- Try using your full email address as username

### General SMTP Issues

**Error: "Connection timeout"**
- Check if your firewall is blocking the SMTP port
- Verify the SMTP_HOST and SMTP_PORT are correct

**Error: "SSL/TLS error"**
- Try changing SMTP_SECURE to `false` for port 587
- Or use `true` for port 465

## Security Best Practices

1. **Never commit your `.env` file** to version control
2. **Use App Passwords** for Gmail instead of your main password
3. **Rotate passwords** regularly
4. **Use environment-specific** email configurations

## Production Considerations

For production, consider using:
- **Amazon SES** for high-volume email sending
- **SendGrid** for reliable delivery
- **Mailgun** for developer-friendly APIs
- **Custom SMTP** from your hosting provider

## API Endpoints

The email service is used by these endpoints:

- `POST /api/auth/request-email-verification` - Send OTP for email verification
- `POST /api/auth/request-password-reset` - Send password reset link

## Testing

Run the test script to verify your configuration:

```bash
node test-nodemailer.js
```

This will:
1. Test the SMTP connection
2. Send a test OTP email
3. Send a test password reset email

## Support

If you encounter issues:
1. Check the console logs for detailed error messages
2. Verify your email credentials
3. Test with a different email provider
4. Check your network/firewall settings
