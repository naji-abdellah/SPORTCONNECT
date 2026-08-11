// ============================================
// auth-service/src/config/firebase.js
// Initialisation du Firebase Admin SDK
// ============================================
//
// AVANT de lancer : assure-toi que le fichier serviceAccountKey.json
// est bien placé dans le dossier auth-service/ (à côté de package.json)
//
// Comment obtenir serviceAccountKey.json :
//   1. Console Firebase → Paramètres (⚙️) → Comptes de service
//   2. Clique "Générer une nouvelle clé privée"
//   3. Renomme le fichier téléchargé en serviceAccountKey.json
//   4. Place-le dans auth-service/
//   ⚠️  Ne JAMAIS le mettre sur GitHub !

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
  console.error('❌ Firebase service account key introuvable !', e.message);
  process.exit(1);
}

// Initialise Firebase Admin SDK une seule fois
// (la condition évite une double initialisation si le fichier est importé plusieurs fois)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialisé (Auth Service)');
}

module.exports = admin;
