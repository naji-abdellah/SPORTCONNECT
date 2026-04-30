// ============================================
// user-service/debug-token.js
// Lance ce script pour diagnostiquer le problème
// Usage : node debug-token.js <ton_idToken>
// ============================================

require('dotenv').config();
const admin = require('firebase-admin');

// ── Étape 1 : Vérifier que serviceAccountKey.json existe ──
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
  console.log('✅ serviceAccountKey.json trouvé');
  console.log('   → project_id :', serviceAccount.project_id);
  console.log('   → client_email :', serviceAccount.client_email);
} catch (e) {
  console.error('❌ PROBLÈME : serviceAccountKey.json introuvable !');
  console.error('   → Place le fichier dans user-service/ (même niveau que package.json)');
  process.exit(1);
}

// ── Étape 2 : Initialiser Firebase ──
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
console.log('✅ Firebase initialisé');

// ── Étape 3 : Vérifier le token passé en argument ──
const token = process.argv[2];

if (!token) {
  console.log('\n⚠️  Utilisation : node debug-token.js <ton_idToken>');
  console.log('   Récupère le idToken depuis POST http://localhost:3001/auth/login');
  process.exit(0);
}

console.log('\n🔍 Vérification du token...');
admin.auth().verifyIdToken(token)
  .then(decoded => {
    console.log('✅ Token valide !');
    console.log('   → uid   :', decoded.uid);
    console.log('   → email :', decoded.email);
    console.log('   → exp   :', new Date(decoded.exp * 1000).toLocaleString());
    console.log('\n✅ Le user-service peut bien valider ce token.');
    console.log('   Si tu as quand même 401, le problème vient du header Postman.');
  })
  .catch(err => {
    console.error('\n❌ Token invalide :', err.code);
    if (err.code === 'auth/argument-error') {
      console.error('   → Le token est mal formaté ou tronqué.');
      console.error('   → Vérifie que tu as copié le idToken EN ENTIER depuis /auth/login');
    }
    if (err.code === 'auth/id-token-expired') {
      console.error('   → Le token a expiré (validité 1h).');
      console.error('   → Refais POST /auth/login pour obtenir un nouveau token.');
    }
    if (err.code === 'auth/invalid-credential') {
      console.error('   → Le serviceAccountKey.json ne correspond pas au bon projet Firebase.');
      console.error('   → Vérifie que c\'est bien la clé du projet sportconnect.');
    }
  });
