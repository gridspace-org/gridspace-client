import { Resend } from "resend";
import logger from "../config/logger.js";
import { externalServices } from "../libs/externalServices.js";

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@gridspace.com.ng';
    this.fromName = process.env.FROM_NAME || 'GridSpace';
  }

  /**
   * Send OTP email for email verification
   * @param {string} toEmail - Recipient email address
   * @param {string} otp - The OTP code
   * @param {string} userName - User's name (optional)
   * @returns {Promise<Object>} Result of email sending
   */
  async sendOTPEmail(toEmail, otp, userName = "User") {
    try {
      const { data, error } = await externalServices.email.sendResend({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [toEmail],
        subject: "Verify Your Email - GridSpace",
        html: this.getOTPEmailTemplate(otp, userName),
        text: this.getOTPEmailTextTemplate(otp, userName),
      });

      if (error) {
        logger.error("Error sending OTP email with Resend:", error);
        return {
          success: false,
          error: error.message,
          message: "Failed to send OTP email",
        };
      }

      return {
        success: true,
        messageId: data.id,
        message: "OTP email sent successfully",
      };
    } catch (error) {
      logger.error("Error sending OTP email:", error);
      if (error.code === "EMAIL_SERVICE_UNAVAILABLE") {
        return {
          success: false,
          error: error.message,
          message:
            "Email service temporarily unavailable. Please try again later.",
        };
      }
      return {
        success: false,
        error: error.message,
        message: "Failed to send OTP email",
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
  async sendPasswordResetEmail(toEmail, resetOtp, userName = "User") {
    try {
      const { data, error } = await externalServices.email.sendResend({
        from: `${this.fromName} <${this.fromEmail}>`,
        to: [toEmail],
        subject: "Reset Your Password - GridSpace",
        html: this.getPasswordResetEmailTemplate(resetOtp, userName),
        text: this.getPasswordResetEmailTextTemplate(resetOtp, userName),
      });

      if (error) {
        logger.error("Error sending password reset email with Resend:", error);
        return {
          success: false,
          error: error.message,
          message: "Failed to send password reset email",
        };
      }

      return {
        success: true,
        messageId: data.id,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      logger.error("Error sending password reset email:", error);
      if (error.code === "EMAIL_SERVICE_UNAVAILABLE") {
        return {
          success: false,
          error: error.message,
          message:
            "Email service temporarily unavailable. Please try again later.",
        };
      }
      return {
        success: false,
        error: error.message,
        message: "Failed to send password reset email",
      };
    }
  }

  /**
   * Test email configuration (Resend does not have a direct 'verify' method like Nodemailer)
   * @returns {Promise<Object>} Test result
   */
  async testConnection() {
    try {
      // For Resend, a successful send operation implies a valid connection.
      // We can attempt a dummy send or rely on the API key being valid.
      // For now, we'll just return success if the API key is present.
      if (process.env.RESEND_API_KEY) {
        return {
          success: true,
          message: "Resend API key is configured",
        };
      } else {
        return {
          success: false,
          message: "Resend API key is not configured",
        };
      }
    } catch (error) {
      logger.error("Resend connection test failed:", error);
      return {
        success: false,
        error: error.message,
        message: "Resend connection test failed",
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
  getPasswordResetEmailTemplate(resetOtp, userName) {
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
          .otp-container {
            background-color: #f8fafc;
            border: 2px dashed #cbd5e1;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 4px;
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
            <h1>Reset Your Password</h1>
          </div>
          
          <p>Hello ${userName},</p>
          
          <p>We received a request to reset your password for your GridSpace account. Use the code below to complete your password reset in the app:</p>

          <div class="otp-container">
            <p style="margin: 0 0 10px 0; color: #6b7280;">Your password reset code:</p>
            <div class="otp-code">${resetOtp}</div>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This code will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.
          </div>
          
          <p>If you're having trouble, copy and paste the code directly into the password reset form.</p>
          
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
  getPasswordResetEmailTextTemplate(resetOtp, userName) {
    return `
GridSpace - Password Reset

Hello ${userName},

We received a request to reset your password for your GridSpace account. Use the code below to complete your password reset in the app:

Your password reset code: ${resetOtp}

Important: This code will expire in 1 hour for security reasons. If you didn't request a password reset, please ignore this email.

---
This email was sent by GridSpace. If you didn't request a password reset, please ignore this email.
© 2024 GridSpace. All rights reserved.
    `;
  }
}

export default new EmailService();
