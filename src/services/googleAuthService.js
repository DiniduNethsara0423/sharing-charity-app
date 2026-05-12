const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

let client = null;
if (CLIENT_ID) client = new OAuth2Client(CLIENT_ID);

const verifyIdToken = async (idToken) => {
  if (!client) throw new Error('Google OAuth client not configured');
  const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
  const payload = ticket.getPayload();
  // payload contains: sub (id), email, email_verified, name, picture
  return payload;
};

module.exports = { verifyIdToken };
