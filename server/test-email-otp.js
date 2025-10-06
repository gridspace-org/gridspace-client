/**
 * Test script for email OTP functionality
 * Run this script to test the OTP service and email service
 * 
 * Usage: node test-email-otp.js
 */

const { generateSecureOTP, verifyOTP, isOTPExpired, getRemainingTime } = require('./services/otpService');
const emailService = require('./services/emailService');

console.log('🧪 Testing Email OTP Implementation\n');

// Test 1: OTP Generation
console.log('1. Testing OTP Generation:');
const { otp, createdAt, expiresAt, expiryMinutes } = generateSecureOTP(6, 10);
console.log(`   Generated OTP: ${otp}`);
console.log(`   Created at: ${createdAt.toISOString()}`);
console.log(`   Expires at: ${expiresAt.toISOString()}`);
console.log(`   Expiry minutes: ${expiryMinutes}`);
console.log(`   ✅ OTP generation successful\n`);

// Test 2: OTP Verification (Valid)
console.log('2. Testing OTP Verification (Valid):');
const validResult = verifyOTP(otp, otp, expiresAt);
console.log(`   Result: ${validResult.success ? '✅ Valid' : '❌ Invalid'}`);
console.log(`   Message: ${validResult.message}\n`);

// Test 3: OTP Verification (Invalid)
console.log('3. Testing OTP Verification (Invalid):');
const invalidResult = verifyOTP('123456', otp, expiresAt);
console.log(`   Result: ${invalidResult.success ? '✅ Valid' : '❌ Invalid'}`);
console.log(`   Message: ${invalidResult.message}\n`);

// Test 4: OTP Expiry Check
console.log('4. Testing OTP Expiry Check:');
const isExpired = isOTPExpired(expiresAt);
console.log(`   Is expired: ${isExpired ? '✅ Yes' : '❌ No'}\n`);

// Test 5: Remaining Time
console.log('5. Testing Remaining Time:');
const remaining = getRemainingTime(expiresAt);
console.log(`   Remaining time: ${remaining} minutes\n`);

// Test 6: Email Service Configuration
console.log('6. Testing Email Service Configuration:');
console.log(`   From Email: ${emailService.fromEmail}`);
console.log(`   From Name: ${emailService.fromName}`);
console.log(`   MailerSend configured: ${emailService.mailerSend ? '✅ Yes' : '❌ No'}\n`);

// Test 7: Email Template Generation
console.log('7. Testing Email Template Generation:');
const testOTP = '123456';
const testUserName = 'John Doe';
const htmlTemplate = emailService.getOTPEmailTemplate(testOTP, testUserName);
const textTemplate = emailService.getOTPEmailTextTemplate(testOTP, testUserName);

console.log(`   HTML template length: ${htmlTemplate.length} characters`);
console.log(`   Text template length: ${textTemplate.length} characters`);
console.log(`   HTML contains OTP: ${htmlTemplate.includes(testOTP) ? '✅ Yes' : '❌ No'}`);
console.log(`   Text contains OTP: ${textTemplate.includes(testOTP) ? '✅ Yes' : '❌ No'}`);
console.log(`   HTML contains user name: ${htmlTemplate.includes(testUserName) ? '✅ Yes' : '❌ No'}`);
console.log(`   Text contains user name: ${textTemplate.includes(testUserName) ? '✅ Yes' : '❌ No'}\n`);

console.log('🎉 All tests completed!');
console.log('\n📝 Next Steps:');
console.log('1. Install MailerSend package: npm install mailersend');
console.log('2. Set up your MailerSend account and domain');
console.log('3. Add MailerSend configuration to your .env file');
console.log('4. Test the actual email sending functionality');
console.log('\n📚 See MAILERSEND_SETUP.md for detailed setup instructions.');
