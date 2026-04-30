// ============================================
// auth-service/src/middleware/verifyToken.js
// Middleware : vérifie le token Firebase JWT
// ============================================
//
// Comment ça marche ?
//   1. Le client envoie une requête avec le header :
//      Authorization: Bearer eyJhbGciOiJSUzI1N...
//   2. Ce middleware extrait le token
//   3. Firebase vérifie la signature cryptographique du token
//   4. Si valide → on attache req.user et on passe à la route
//   5. Si invalide → on renvoie une erreur 401

const admin = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Vérification : le header doit être présent et commencer par "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Accès refusé : token manquant.',
        aide: 'Ajoute le header : Authorization: Bearer <ton_idToken>',
      });
    }

    // Extrait le token (tout ce qui vient après "Bearer ")
    const idToken = authHeader.split('Bearer ')[1];

    // Firebase vérifie :
    //  - la signature du token (impossible à falsifier)
    //  - la date d'expiration (valide 1 heure)
    //  - l'appartenance au bon projet Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // On attache les infos décodées à la requête pour les routes suivantes
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next(); // ✅ Token valide → passe à la route
  } catch (error) {
    // Le token est expiré ou falsifié
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expiré. Reconnecte-toi pour obtenir un nouveau token.',
      });
    }
    return res.status(401).json({
      error: 'Token invalide. Reconnecte-toi.',
    });
  }
};

module.exports = verifyToken;
