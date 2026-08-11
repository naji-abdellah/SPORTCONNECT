const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// ── MongoDB Atlas Connection ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://najiabdellahcp_db_user:6A7T8i7vbRr1zVGX@cluster0.o9nwu9c.mongodb.net/sportconnect_sessions?retryWrites=true&w=majority';

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected on Vercel');
  } catch (err) {
    console.error('❌ MongoDB error:', err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ── Firebase Admin SDK Connection ──
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id || 'sportconnect-818cd',
      });
    } else {
      admin.initializeApp({
        projectId: 'sportconnect-818cd',
      });
    }
  } catch (e) {
    console.warn('⚠️ Firebase Admin init warning:', e.message);
  }
}

// ── Auth Routes ──
app.post('/api/auth/register', async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Les champs email, password et displayName sont obligatoires.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });
    res.status(201).json({
      message: 'Compte créé avec succès ! Tu peux maintenant te connecter.',
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
    });
  } catch (error) {
    const erreurs = {
      'auth/email-already-exists': { status: 409, message: 'Cet email est déjà utilisé.' },
      'auth/invalid-email':        { status: 400, message: 'Format d\'email invalide.' },
      'auth/weak-password':        { status: 400, message: 'Mot de passe trop faible.' },
    };
    const err = erreurs[error.code];
    if (err) return res.status(err.status).json({ error: err.message });
    res.status(500).json({ error: error.message || 'Erreur serveur lors de l\'inscription.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email et password sont obligatoires.' });
  }
  try {
    const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyAtwyeEZkREsUw0UMXk5vLTF6vvfhDwh5I';
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      const erreurs = {
        'INVALID_PASSWORD':          { status: 401, message: 'Mot de passe incorrect.' },
        'EMAIL_NOT_FOUND':           { status: 404, message: 'Aucun compte avec cet email.' },
        'USER_DISABLED':             { status: 403, message: 'Ce compte a été désactivé.' },
        'TOO_MANY_ATTEMPTS_TRY_LATER': { status: 429, message: 'Trop de tentatives. Réessaie plus tard.' },
        'INVALID_LOGIN_CREDENTIALS': { status: 401, message: 'Email ou mot de passe incorrect.' },
      };
      const err = erreurs[data.error?.message];
      if (err) return res.status(err.status).json({ error: err.message });
      return res.status(400).json({ error: data.error?.message || 'Connexion échouée.' });
    }
    res.json({
      message: 'Connexion réussie !',
      uid: data.localId,
      email: data.email,
      displayName: data.displayName || email.split('@')[0],
      idToken: data.idToken,
      refreshToken: data.refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Erreur serveur lors de la connexion.' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'sportconnect-vercel-api' });
});

module.exports = app;
