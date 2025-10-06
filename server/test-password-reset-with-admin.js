/**
 * Test password reset with admin email (for trial accounts)
 * Replace 'your-admin-email@example.com' with your actual admin email
 */

require('dotenv').config();
const emailService = require('./services/emailService');

console.log('🧪 Testing Password Reset with Admin Email\n');

// Replace this with your actual admin email (the one you used to sign up for MailerSend)
const ADMIN_EMAIL = 'your-admin-email@example.com'; // CHANGE THIS!

console.log('⚠️  IMPORTANT: Replace ADMIN_EMAIL with your actual admin email address');
console.log(`📧 Current admin email: ${ADMIN_EMAIL}\n`);

if (ADMIN_EMAIL === 'info@gridspace.com.ng') {
  console.log('❌ Please update the ADMIN_EMAIL variable with your actual admin email address');
  console.log('   This should be the email you used to sign up for MailerSend');
  process.exit(1);
}

async function testPasswordReset() {
  try {
    console.log('📧 Sending password reset email...');
    
    const testToken = 'test-token-123456789';
    const testUserName = 'Test User';
    
    const result = await emailService.sendPasswordResetEmail(
      ADMIN_EMAIL,
      testToken,
      testUserName
    );
    
    if (result.success) {
      console.log('✅ Password reset email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📝 Message: ${result.message}`);
    } else {
      console.log('❌ Failed to send password reset email');
      console.log(`📝 Error: ${result.error}`);
      console.log(`📝 Message: ${result.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Unexpected error: ${error.message}`);
  }
}

testPasswordReset().then(() => {
  console.log('\n🎯 Test Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. Check your admin email inbox for the password reset email');
  console.log('2. If successful, you can now test with real users (after upgrading your plan)');
  console.log('3. To upgrade: Go to MailerSend dashboard > Billing > Upgrade Plan');
});
