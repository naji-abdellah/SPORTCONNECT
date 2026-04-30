// ============================================
// user-service/src/server.js
// Point d'entrée du microservice User
// ============================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/routes/user.routes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes);

// ── Health Check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'user-service',
    port: PORT,
    timestamp: new Date().toISOString(),
    routes: [
      'POST   /users/internal/create  — Création interne (Auth Service)',
      'POST   /users                  — Créer mon profil (token requis)',
      'GET    /users/me               — Mon profil (token requis)',
      'GET    /users                  — Lister les utilisateurs (token requis)',
      'GET    /users/:uid             — Profil d\'un utilisateur (token requis)',
      'PATCH  /users/me               — Modifier mon profil (token requis)',
      'DELETE /users/me               — Supprimer mon compte (token requis)',
    ],
  });
});

// ── Route 404 ──
app.use((req, res) => {
  res.status(404).json({
    error: `Route introuvable : ${req.method} ${req.path}`,
    aide: 'Consulte GET /health pour voir les routes disponibles.',
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ===================================');
  console.log(`   USER SERVICE démarré !`);
  console.log(`   URL : http://localhost:${PORT}`);
  console.log(`   Health : http://localhost:${PORT}/health`);
  console.log('=====================================');
  console.log('');
});
