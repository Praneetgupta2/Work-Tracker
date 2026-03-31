const admin = require('firebase-admin');

// For local development, we load from the JSON file.
// For production (Render), we will load from the FIREBASE_SERVICE_ACCOUNT environment variable.
let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Render/Railway will have the JSON stringified in this env var
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Firebase initialized via Environment Variable');
  } else {
    // Fallback to local file for development
    serviceAccount = require('../serviceAccountKey.json');
    console.log('ℹ️ Firebase initialized via Local serviceAccountKey.json');
  }
} catch (error) {
  console.error('❌ Failed to load Firebase Service Account:', error.message);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://work-79c21-default-rtdb.firebaseio.com"
});

const rtdb = admin.database();

module.exports = { admin, rtdb };
