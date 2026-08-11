// ============================================
// user-service/src/config/firebase.js
// Initialisation du Firebase Admin SDK + Firestore
// ============================================

const admin = require('firebase-admin');

let serviceAccount;
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : process.env.FIREBASE_SERVICE_ACCOUNT;
  } else {
    serviceAccount = require('../../serviceAccountKey.json');
  }
} catch (e) {
  console.error('❌ serviceAccountKey.json introuvable dans user-service !', e.message);
  process.exit(1);
}

const appName = 'user-service';
const existingApp = admin.apps.find(a => a.name === appName);

if (!existingApp) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'sportconnect-818cd',
  }, appName);
  console.log('✅ Firebase Admin SDK initialisé (User Service)');
}

const app = admin.app(appName);
const db = app.firestore();
db.settings({ ignoreUndefinedProperties: true });
module.exports = { admin: app, db };