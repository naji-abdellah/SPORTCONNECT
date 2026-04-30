// ============================================
// auth-service/src/routes/auth.routes.js
// Routes : Register / Login / Me / Verify
// ============================================

const express = require('express');
const fetch = require('node-fetch');
const admin = require('../config/firebase');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// ──────────────────────────────────────────────────────────────
// POST /auth/register
// Inscription d'un nouvel utilisateur
//
// Body JSON attendu :
// {
//   "email": "mehdi@gmail.com",
//   "password": "monmotdepasse123",
//   "displayName": "Mehdi Alami",
//   "sportPrefere": "football",
//   "niveau": "intermédiaire",
//   "localisation": "Casablanca"
// }
// ──────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, displayName, sportPrefere, niveau, localisation, age, bio } = req.body;

  // ── Validation des champs obligatoires ──
  if (!email || !password || !displayName) {
    return res.status(400).json({
      error: 'Les champs email, password et displayName sont obligatoires.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: 'Le mot de passe doit contenir au moins 6 caractères.',
    });
  }

  try {
    // ── Étape 1 : Créer l'utilisateur dans Firebase Authentication ──
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    console.log(`✅ Utilisateur créé dans Firebase Auth : ${userRecord.uid}`);

    // ── Étape 2 : Notifier le User Service pour créer le profil ──
    // On crée un token Admin temporaire pour appeler le User Service
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:3002';

    try {
      // Créer un custom token pour authentifier l'appel interne
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      await fetch(`${userServiceUrl}/users/internal/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userRecord.uid,
          email: userRecord.email,
          nom: displayName,
          sportPrefere: sportPrefere || 'Non spécifié',
          niveau: niveau || 'Beginner',
          localisation: localisation || 'Non spécifiée',
          age: age ? Number(age) : null,
          bio: bio || '',
        }),
      });
      console.log(`✅ Profil créé dans User Service pour : ${userRecord.uid}`);
    } catch (userServiceError) {
      // Si le User Service est indisponible, on continue quand même
      // (le profil peut être créé plus tard manuellement)
      console.warn('⚠️  User Service indisponible, profil non créé automatiquement.');
    }

    // ── Réponse ──
    res.status(201).json({
      message: 'Compte créé avec succès ! Tu peux maintenant te connecter.',
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });

  } catch (error) {
    // ── Gestion des erreurs Firebase spécifiques ──
    const erreurs = {
      'auth/email-already-exists': { status: 409, message: 'Cet email est déjà utilisé.' },
      'auth/invalid-email':        { status: 400, message: 'Format d\'email invalide.' },
      'auth/weak-password':        { status: 400, message: 'Mot de passe trop faible.' },
    };

    const erreur = erreurs[error.code];
    if (erreur) {
      return res.status(erreur.status).json({ error: erreur.message });
    }

    console.error('❌ Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
});


// ──────────────────────────────────────────────────────────────
// POST /auth/login
// Connexion d'un utilisateur existant
//
// Body JSON attendu :
// {
//   "email": "mehdi@gmail.com",
//   "password": "monmotdepasse123"
// }
//
// Retourne : idToken (à utiliser dans les requêtes suivantes)
// ──────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email et password sont obligatoires.' });
  }

  try {
    // Firebase Admin SDK ne gère pas la vérification du mot de passe directement.
    // On utilise l'API REST Firebase Identity Toolkit pour ça.
    const apiKey = process.env.FIREBASE_API_KEY;

    if (!apiKey) {
      console.error('❌ FIREBASE_API_KEY manquant dans .env');
      return res.status(500).json({
        error: 'Configuration serveur incomplète. Vérifie le fichier .env',
      });
    }

    const firebaseResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true, // Important : demande le JWT en retour
        }),
      }
    );

    const data = await firebaseResponse.json();

    // Si la réponse n'est pas OK, Firebase nous donne un code d'erreur
    if (!firebaseResponse.ok) {
      const erreurs = {
        'INVALID_PASSWORD':          { status: 401, message: 'Mot de passe incorrect.' },
        'EMAIL_NOT_FOUND':           { status: 404, message: 'Aucun compte avec cet email.' },
        'USER_DISABLED':             { status: 403, message: 'Ce compte a été désactivé.' },
        'TOO_MANY_ATTEMPTS_TRY_LATER': { status: 429, message: 'Trop de tentatives. Réessaie plus tard.' },
        'INVALID_LOGIN_CREDENTIALS': { status: 401, message: 'Email ou mot de passe incorrect.' },
      };

      const erreur = erreurs[data.error?.message];
      if (erreur) {
        return res.status(erreur.status).json({ error: erreur.message });
      }
      return res.status(400).json({ error: 'Connexion échouée : ' + data.error?.message });
    }

    // ── Connexion réussie ──
    res.json({
      message: 'Connexion réussie !',
      uid: data.localId,
      email: data.email,
      displayName: data.displayName,
      // ↓ Token JWT Firebase — valable 1 heure
      // À envoyer dans le header : Authorization: Bearer <idToken>
      idToken: data.idToken,
      // ↓ Token de rafraîchissement — valable longtemps
      // Utilise-le pour obtenir un nouveau idToken sans redonner le mot de passe
      refreshToken: data.refreshToken,
      expiresIn: `${data.expiresIn} secondes (${Math.floor(data.expiresIn / 60)} minutes)`,
    });

  } catch (error) {
    console.error('❌ Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
});


// ──────────────────────────────────────────────────────────────
// GET /auth/me
// Récupère le profil Firebase Auth de l'utilisateur connecté
//
// Header requis : Authorization: Bearer <idToken>
// ──────────────────────────────────────────────────────────────
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userRecord = await admin.auth().getUser(req.user.uid);

    res.json({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      emailVerified: userRecord.emailVerified,
      createdAt: userRecord.metadata.creationTime,
      lastSignIn: userRecord.metadata.lastSignInTime,
    });
  } catch (error) {
    console.error('❌ Erreur /me:', error);
    res.status(500).json({ error: 'Impossible de récupérer le profil.' });
  }
});


// ──────────────────────────────────────────────────────────────
// POST /auth/verify
// Vérifie si un token est valide
//
// Utilisé par les autres microservices (User Service, Session Service...)
// pour s'assurer qu'une requête vient d'un utilisateur authentifié.
//
// Header requis : Authorization: Bearer <idToken>
// ──────────────────────────────────────────────────────────────
router.post('/verify', verifyToken, (req, res) => {
  res.json({
    valid: true,
    uid: req.user.uid,
    email: req.user.email,
    message: 'Token valide.',
  });
});


// ──────────────────────────────────────────────────────────────
// POST /auth/logout
// Révoque tous les tokens de l'utilisateur (déconnexion forcée)
//
// Header requis : Authorization: Bearer <idToken>
// ──────────────────────────────────────────────────────────────
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Révoque tous les refresh tokens de cet utilisateur
    await admin.auth().revokeRefreshTokens(req.user.uid);
    res.json({ message: 'Déconnexion réussie. Tous les tokens ont été révoqués.' });
  } catch (error) {
    console.error('❌ Erreur logout:', error);
    res.status(500).json({ error: 'Erreur lors de la déconnexion.' });
  }
});


// GET /auth/users
// Returns all registered users from Firebase Auth
router.get('/users', async (req, res) => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const currentUid = req.headers['x-user-uid'] || '';
    const users = listUsersResult.users
      .filter(u => u.uid !== currentUid)
      .map(u => ({
        uid: u.uid,
        displayName: u.displayName || u.email.split('@')[0],
        email: u.email,
        city: 'Casablanca',
        sport: 'Football',
        level: 'Intermediate',
        sessions: 0,
        bio: 'SportConnect member.',
      }));
    res.json({ users });
  } catch (error) {
    console.error('Error /auth/users:', error);
    res.status(500).json({ error: 'Could not fetch users.' });
  }
});

module.exports = router;
