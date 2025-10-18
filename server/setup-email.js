#!/usr/bin/env node

/**
 * Email Setup Helper for GridSpace
 * This script helps you configure nodemailer for your application
 */

const fs = require('fs');
const path = require('path');

console.log('📧 GridSpace Email Setup Helper\n');

console.log('To configure nodemailer, you need to add the following to your .env file:\n');

console.log('# Email Configuration (Nodemailer)');
console.log('# Choose one of the following configurations:\n');

console.log('# Option 1: Gmail (Recommended for development)');
console.log('SMTP_SERVICE=gmail');
console.log('SMTP_USER=your-email@gmail.com');
console.log('SMTP_APP_PASSWORD=your-gmail-app-password\n');

console.log('# Option 2: Outlook/Hotmail');
console.log('# SMTP_SERVICE=outlook');
console.log('# SMTP_USER=your-email@outlook.com');
console.log('# SMTP_PASS=your-outlook-password\n');

console.log('# Option 3: Custom SMTP Server');
console.log('# SMTP_HOST=smtp.your-provider.com');
console.log('# SMTP_PORT=587');
console.log('# SMTP_SECURE=false');
console.log('# SMTP_USER=your-email@yourdomain.com');
console.log('# SMTP_PASS=your-password\n');

console.log('# Email Settings');
console.log('FROM_EMAIL=noreply@gridspace.com');
console.log('FROM_NAME=GridSpace\n');

console.log('📋 Gmail Setup Instructions:');
console.log('1. Enable 2-Factor Authentication on your Gmail account');
console.log('2. Go to Google Account settings → Security → 2-Step Verification → App passwords');
console.log('3. Generate a new app password for "Mail"');
console.log('4. Use that 16-character password as SMTP_APP_PASSWORD\n');

console.log('🧪 Testing:');
console.log('After configuring your email settings, run: node test-nodemailer.js\n');

console.log('📖 For more details, see: NODEMAILER_SETUP.md');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check for existing email configuration
  if (envContent.includes('SMTP_') || envContent.includes('MAILERSEND_')) {
    console.log('\n⚠️  Found existing email configuration in .env file');
    console.log('You may need to update your configuration to use nodemailer instead of MailerSend');
  }
} else {
  console.log('\n⚠️  No .env file found. Please create one with the configuration above.');
}
