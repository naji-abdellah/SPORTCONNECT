// ============================================
// auth-service/src/server.js
// Point d'entrée du microservice Auth
// ============================================

require('dotenv').config(); // Charge les variables de .env

const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globaux ──
app.use(cors()); // Autorise les requêtes cross-origin (depuis le frontend)
app.use(express.json()); // Parse automatiquement le body JSON des requêtes

// ── Routes ──
app.use('/auth', authRoutes);

// ── Health Check ──
// Permet de vérifier que le service est en vie
// Utile pour les outils de monitoring et les tests Postman
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'auth-service',
    port: PORT,
    timestamp: new Date().toISOString(),
    routes: [
      'POST /auth/register  — Inscription',
      'POST /auth/login     — Connexion',
      'GET  /auth/me        — Mon profil Auth (token requis)',
      'POST /auth/verify    — Vérifier un token (token requis)',
      'POST /auth/logout    — Déconnexion (token requis)',
    ],
  });
});

// ── Route 404 — si une route n'existe pas ──
app.use((req, res) => {
  res.status(404).json({
    error: `Route introuvable : ${req.method} ${req.path}`,
    aide: 'Consulte GET /health pour voir les routes disponibles.',
  });
});

// ── Démarrage du serveur ──
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ===================================');
  console.log(`   AUTH SERVICE démarré !`);
  console.log(`   URL : http://localhost:${PORT}`);
  console.log(`   Health : http://localhost:${PORT}/health`);
  console.log('=====================================');
  console.log('');
});
