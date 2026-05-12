const admin = require('firebase-admin');
const fs = require('fs');

const initFirebase = () => {
  if (admin.apps.length) return admin.app();

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  let credentials;
  if (serviceAccountJson) {
    credentials = JSON.parse(serviceAccountJson);
  } else if (serviceAccountPath && fs.existsSync(serviceAccountPath)) {
    credentials = require(serviceAccountPath);
  } else {
    console.warn('Firebase service account not configured. FCM disabled.');
    return null;
  }

  return admin.initializeApp({ credential: admin.credential.cert(credentials) });
};

initFirebase();

const sendToToken = async (token, notification, data = {}) => {
  if (!token) return null;
  if (!admin.apps.length) return null;
  try {
    const message = {
      token,
      notification: { title: notification.title, body: notification.body },
      data: Object.keys(data).reduce((acc, k) => ({ ...acc, [k]: String(data[k]) }), {}),
    };
    return await admin.messaging().send(message);
  } catch (err) {
    console.error('FCM send error:', err);
    return null;
  }
};

const sendToUser = async (user, notification, data = {}) => {
  if (!user) return null;
  const token = user.device_token;
  return sendToToken(token, notification, data);
};

module.exports = { initFirebase, sendToToken, sendToUser };
