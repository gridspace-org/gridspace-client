import { OAuth2Client } from 'google-auth-library';
const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const verifyGoogleToken = async (idToken) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      fullname: payload.name,
      profilePic: payload.picture,
      emailVerified: payload.email_verified,
    };
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};

const getGoogleAuthUrl = () => {
  const authUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  return authUrl;
};

const getTokensFromCode = async (code) => {
  try {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    const response = await googleClient.request({
      url: 'https://www.googleapis.com/oauth2/v2/userinfo'
    });
    return {
      googleId: response.data.id,
      email: response.data.email,
      fullname: response.data.name,
      profilePic: response.data.picture,
      emailVerified: response.data.verified_email,
    };
  } catch (error) {
    throw new Error('Failed to exchange code for tokens');
  }
};

export {
  googleClient,
  verifyGoogleToken,
  getGoogleAuthUrl,
  getTokensFromCode,
};