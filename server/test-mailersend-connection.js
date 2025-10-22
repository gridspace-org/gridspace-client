/**
 * Test script to diagnose MailerSend connection issues
 * This will help identify the exact problem with email sending
 */

require('dotenv').config();
const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');

console.log('🔍 Diagnosing MailerSend Connection Issues\n');

// Test 1: Environment Variables
console.log('1. Checking Environment Variables:');
console.log(`   MAILERSEND_API_KEY: ${process.env.MAILERSEND_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   MAILERSEND_FROM_EMAIL: ${process.env.MAILERSEND_FROM_EMAIL ? '✅ Set' : '❌ Not set'}`);
console.log(`   MAILERSEND_FROM_NAME: ${process.env.MAILERSEND_FROM_NAME ? '✅ Set' : '❌ Not set'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL ? '✅ Set' : '❌ Not set'}\n`);

if (!process.env.MAILERSEND_API_KEY) {
  console.log('❌ MAILERSEND_API_KEY is not set. Please add it to your .env file.');
  process.exit(1);
}

// Test 2: MailerSend Initialization
console.log('2. Testing MailerSend Initialization:');
try {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
  });
  console.log('   ✅ MailerSend client initialized successfully\n');
} catch (error) {
  console.log(`   ❌ Failed to initialize MailerSend: ${error.message}\n`);
  process.exit(1);
}

// Test 3: Test Email Sending
console.log('3. Testing Email Sending:');
async function testEmailSending() {
  try {
    const mailerSend = new MailerSend({
      apiKey: process.env.MAILERSEND_API_KEY,
    });

    const sentFrom = new Sender(process.env.MAILERSEND_FROM_EMAIL, process.env.MAILERSEND_FROM_NAME);
    // For trial accounts, use the admin email (the one used to sign up for MailerSend)
    const recipients = [new Recipient('your-admin-email@example.com', 'Test User')];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setReplyTo(sentFrom)
      .setSubject('Test Email - GridSpace')
      .setHtml('<h1>Test Email</h1><p>This is a test email from GridSpace.</p>')
      .setText('Test Email\n\nThis is a test email from GridSpace.');

    console.log('   📧 Attempting to send test email...');
    const response = await mailerSend.email.send(emailParams);
    
    console.log('   ✅ Email sent successfully!');
    console.log(`   📧 Message ID: ${response.body.message_id}\n`);
    
  } catch (error) {
    console.log(`   ❌ Failed to send email: ${error.message || 'Unknown error'}`);
    console.log(`   🔍 Full error object:`, error);
    
    // Provide specific error guidance
    const errorMessage = error.message || '';
    if (errorMessage.includes('Unauthorized')) {
      console.log('   💡 This usually means:');
      console.log('      - Invalid API key');
      console.log('      - API key doesn\'t have required permissions');
      console.log('      - Check your MailerSend dashboard for the correct API key\n');
    } else if (errorMessage.includes('Domain')) {
      console.log('   💡 This usually means:');
      console.log('      - Domain not verified in MailerSend');
      console.log('      - From email address not from verified domain');
      console.log('      - Check your MailerSend domains section\n');
    } else if (errorMessage.includes('Rate limit')) {
      console.log('   💡 This usually means:');
      console.log('      - You\'ve exceeded your email sending limit');
      console.log('      - Check your MailerSend plan limits\n');
    } else {
      console.log('   💡 Check the full error details above for more information\n');
    }
  }
}

// Test 4: Check API Key Format
console.log('4. Checking API Key Format:');
const apiKey = process.env.MAILERSEND_API_KEY;
if (apiKey.startsWith('mlsn.')) {
  console.log('   ✅ API key format looks correct (starts with mlsn.)');
} else {
  console.log('   ⚠️  API key format might be incorrect (should start with mlsn.)');
}
console.log(`   📝 API key length: ${apiKey.length} characters\n`);

// Test 5: Check From Email Domain
console.log('5. Checking From Email Domain:');
const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
const domain = fromEmail.split('@')[1];
console.log(`   📧 From email: ${fromEmail}`);
console.log(`   🌐 Domain: ${domain}`);
console.log(`   💡 Make sure this domain is verified in your MailerSend dashboard\n`);

// Run the email test
testEmailSending().then(() => {
  console.log('🎯 Diagnosis Complete!');
  console.log('\n📝 Next Steps:');
  console.log('1. If email sending failed, check the error message above');
  console.log('2. Verify your domain in MailerSend dashboard');
  console.log('3. Check your API key permissions');
  console.log('4. Restart your server after making changes');
  console.log('\n📚 See MAILERSEND_SETUP.md for detailed setup instructions.');
}).catch(error => {
  console.log(`\n❌ Unexpected error: ${error.message}`);
});
