// ============================================
// user-service/src/middleware/verifyToken.js
// Middleware : vérifie le token Firebase JWT
// ============================================

const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔍 Debug (tu peux supprimer après)
    console.log("HEADER AUTH:", authHeader);

    // 1. Vérifier présence du header
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Accès refusé : token manquant.',
        aide: 'Ajoute le header : Authorization: Bearer <idToken>',
      });
    }

    // 2. Extraire le token
    const idToken = authHeader.split(' ')[1];

    console.log("TOKEN EXTRAIT:", idToken);

    // 3. Vérifier le token avec Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 4. Attacher les infos à req.user
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    // 5. Passer à la suite
    next();

  } catch (error) {
    console.error("ERREUR VERIFY:", error);

    // Gestion des erreurs spécifiques
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expiré. Reconnecte-toi.',
      });
    }

    return res.status(401).json({
      error: 'Token invalide. Reconnecte-toi.',
    });
  }
};

// ✅ IMPORTANT : exporter la fonction directement
module.exports = verifyToken;