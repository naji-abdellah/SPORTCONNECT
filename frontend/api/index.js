const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── Global CORS & Preflight Handler ──
app.use(cors({ origin: true, credentials: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// ── MongoDB Connection ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://najiabdellahcp_db_user:6A7T8i7vbRr1zVGX@cluster0.o9nwu9c.mongodb.net/sportconnect_sessions?retryWrites=true&w=majority';

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAtwyeEZkREsUw0UMXk5vLTF6vvfhDwh5I';

// ── Auth: Register ──
app.post(['/api/auth/register', '/auth/register', '/register'], async (req, res) => {
  const { email, password, displayName } = req.body;
  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Les champs email, password et displayName sont obligatoires.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const erreurs = {
        'EMAIL_EXISTS': { status: 409, message: 'Cet email est déjà utilisé.' },
        'INVALID_EMAIL': { status: 400, message: 'Format d\'email invalide.' },
        'WEAK_PASSWORD': { status: 400, message: 'Mot de passe trop faible.' },
      };
      const err = erreurs[data.error?.message];
      if (err) return res.status(err.status).json({ error: err.message });
      return res.status(400).json({ error: data.error?.message || 'Inscription échouée.' });
    }

    if (displayName && data.idToken) {
      await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: data.idToken, displayName, returnSecureToken: true }),
        }
      );
    }

    res.status(201).json({
      message: 'Compte créé avec succès ! Tu peux maintenant te connecter.',
      uid: data.localId,
      email: data.email,
      displayName: displayName || data.displayName,
    });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
  }
});

// ── Auth: Login ──
app.post(['/api/auth/login', '/auth/login', '/login'], async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email et password sont obligatoires.' });
  }

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
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
    console.error('❌ Erreur login:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
});

app.get(['/api/health', '/health', '/api'], (req, res) => {
  res.json({ status: 'OK', service: 'sportconnect-vercel-api', time: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

module.exports = app;
