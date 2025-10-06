const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

class EmailService {
  constructor() {
    this.mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });
    
    this.fromEmail = process.env.MAILERSEND_FROM_EMAIL || 'noreply@gridspace.com';
    this.fromName = process.env.MAILERSEND_FROM_NAME || 'GridSpace';
  }

  /**
   * Send OTP email for email verification
   * @param {string} toEmail - Recipient email address
   * @param {string} otp - The OTP code
   * @param {string} userName - User's name (optional)
   * @returns {Promise<Object>} Result of email sending
   */
  async sendOTPEmail(toEmail, otp, userName = 'User') {
    try {
      const sentFrom = new Sender(this.fromEmail, this.fromName);
      const recipients = [new Recipient(toEmail, userName)];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject('Verify Your Email - GridSpace')
        .setHtml(this.getOTPEmailTemplate(otp, userName))
        .setText(this.getOTPEmailTextTemplate(otp, userName));

      const response = await this.mailerSend.email.send(emailParams);
      
      return {
        success: true,
        messageId: response.body.message_id,
        message: 'OTP email sent successfully'
      };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send OTP email'
      };
    }
  }

  /**
   * Send password reset email
   * @param {string} toEmail - Recipient email address
   * @param {string} resetToken - Password reset token
   * @param {string} userName - User's name (optional)
   * @returns {Promise<Object>} Result of email sending
   */
  async sendPasswordResetEmail(toEmail, resetToken, userName = 'User') {
    try {
      const sentFrom = new Sender(this.fromEmail, this.fromName);
      const recipients = [new Recipient(toEmail, userName)];
      
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject('Reset Your Password - GridSpace')
        .setHtml(this.getPasswordResetEmailTemplate(resetUrl, userName))
        .setText(this.getPasswordResetEmailTextTemplate(resetUrl, userName));

      const response = await this.mailerSend.email.send(emailParams);
      
      return {
        success: true,
        messageId: response.body.message_id,
        message: 'Password reset email sent successfully'
      };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send password reset email'
      };
    }
  }

  /**
   * Get HTML template for OTP email
   * @param {string} otp - The OTP code
   * @param {string} userName - User's name
   * @returns {string} HTML email template
   */
  getOTPEmailTemplate(otp, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - GridSpace</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .otp-container {
            background-color: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GridSpace</div>
            <h1>Verify Your Email Address</h1>
          </div>
          
          <p>Hello ${userName},</p>
          
          <p>Thank you for signing up with GridSpace! To complete your registration and verify your email address, please use the verification code below:</p>
          
          <div class="otp-container">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Your verification code is:</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This code will expire in 10 minutes for security reasons. If you didn't request this verification, please ignore this email.
          </div>
          
          <p>If you're having trouble with the code above, you can also copy and paste it directly into the verification field.</p>
          
          <p>Welcome to GridSpace!</p>
          
          <div class="footer">
            <p>This email was sent by GridSpace. If you didn't create an account, please ignore this email.</p>
            <p>&copy; 2024 GridSpace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get text template for OTP email
   * @param {string} otp - The OTP code
   * @param {string} userName - User's name
   * @returns {string} Text email template
   */
  getOTPEmailTextTemplate(otp, userName) {
    return `
GridSpace - Email Verification

Hello ${userName},

Thank you for signing up with GridSpace! To complete your registration and verify your email address, please use the verification code below:

Your verification code is: ${otp}

Important: This code will expire in 10 minutes for security reasons. If you didn't request this verification, please ignore this email.

If you're having trouble with the code above, you can also copy and paste it directly into the verification field.

Welcome to GridSpace!

---
This email was sent by GridSpace. If you didn't create an account, please ignore this email.
© 2024 GridSpace. All rights reserved.
    `;
  }

  /**
   * Get HTML template for password reset email
   * @param {string} resetUrl - Password reset URL
   * @param {string} userName - User's name
   * @returns {string} HTML email template
   */
  getPasswordResetEmailTemplate(resetUrl, userName) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - GridSpace</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .reset-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">GridSpace</div>
            <h1>Reset Your Password</h1>
          </div>
          
          <p>Hello ${userName},</p>
          
          <p>We received a request to reset your password for your GridSpace account. Click the button below to reset your password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="reset-button">Reset Password</a>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
          
          <div class="footer">
            <p>This email was sent by GridSpace. If you didn't request a password reset, please ignore this email.</p>
            <p>&copy; 2024 GridSpace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get text template for password reset email
   * @param {string} resetUrl - Password reset URL
   * @param {string} userName - User's name
   * @returns {string} Text email template
   */
  getPasswordResetEmailTextTemplate(resetUrl, userName) {
    return `
GridSpace - Password Reset

Hello ${userName},

We received a request to reset your password for your GridSpace account. Click the link below to reset your password:

${resetUrl}

Important: This link will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.

---
This email was sent by GridSpace. If you didn't request a password reset, please ignore this email.
© 2024 GridSpace. All rights reserved.
    `;
  }
}

module.exports = new EmailService();
