require('dotenv').config();
const emailService = require('./services/emailService');

async function testNodemailer() {
  console.log('🔧 Testing Nodemailer Configuration...\n');

  // Test 1: Verify connection
  console.log('1. Testing email connection...');
  const connectionTest = await emailService.testConnection();
  
  if (connectionTest.success) {
    console.log('✅ Connection successful:', connectionTest.message);
  } else {
    console.log('❌ Connection failed:', connectionTest.message);
    console.log('Error details:', connectionTest.error);
    console.log('\n📋 Please check your email configuration in .env file');
    console.log('Required environment variables:');
    console.log('- SMTP_SERVICE (gmail/outlook) or SMTP_HOST');
    console.log('- SMTP_USER (your email)');
    console.log('- SMTP_PASS or SMTP_APP_PASSWORD (your password/app password)');
    return;
  }

  // Test 2: Send test OTP email
  console.log('\n2. Testing OTP email sending...');
  const testEmail = process.env.TEST_EMAIL || process.env.SMTP_USER;
  
  if (!testEmail) {
    console.log('⚠️  No test email provided. Set TEST_EMAIL in .env to test email sending');
    return;
  }

  const otpResult = await emailService.sendOTPEmail(testEmail, '123456', 'Test User');
  
  if (otpResult.success) {
    console.log('✅ OTP email sent successfully!');
    console.log('Message ID:', otpResult.messageId);
  } else {
    console.log('❌ Failed to send OTP email:', otpResult.message);
    console.log('Error:', otpResult.error);
  }

  // Test 3: Send test password reset email
  console.log('\n3. Testing password reset email sending...');
  const resetResult = await emailService.sendPasswordResetEmail(
    testEmail, 
    'test-reset-token-123', 
    'Test User'
  );
  
  if (resetResult.success) {
    console.log('✅ Password reset email sent successfully!');
    console.log('Message ID:', resetResult.messageId);
  } else {
    console.log('❌ Failed to send password reset email:', resetResult.message);
    console.log('Error:', resetResult.error);
  }

  console.log('\n🎉 Nodemailer test completed!');
}

// Run the test
testNodemailer().catch(console.error);
