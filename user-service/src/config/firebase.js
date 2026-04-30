// ============================================
// user-service/src/config/firebase.js
// Initialisation du Firebase Admin SDK + Firestore
// ============================================

const admin = require('firebase-admin');

let serviceAccount;
try {
  serviceAccount = require('../../serviceAccountKey.json');
} catch (e) {
  console.error('❌ serviceAccountKey.json introuvable dans user-service !');
  console.error('   → Copie le fichier depuis auth-service/serviceAccountKey.json');
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