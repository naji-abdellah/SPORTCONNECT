const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// ❌ REMOVED: app.use(express.json())
// The gateway must NOT parse the body — it must stream it raw to downstream services.
// Parsing it here consumes the stream, causing "request aborted" in the target service.

// ── Service URLs (resolved via Docker internal DNS) ──
const AUTH_URL    = process.env.AUTH_SERVICE_URL    || 'http://auth-service:3001';
const USER_URL    = process.env.USER_SERVICE_URL    || 'http://user-service:3002';
const SESSION_URL = process.env.SESSION_SERVICE_URL || 'http://session-service:5002';
const MATCH_URL   = process.env.MATCH_SERVICE_URL   || 'http://matchmaking-service:8083';
const PERF_URL    = process.env.PERF_SERVICE_URL    || 'http://performance-service:8084';

const proxy = (target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite,
    proxyTimeout: 10000,
    timeout: 10000,
    on: {
      error: (err, req, res) => {
        console.error(`[Gateway] Proxy error → ${target}:`, err.message);
        res.status(502).json({ error: 'Service unavailable', service: target });
      },
    },
  });

// ── Health check ──
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'api-gateway',
    port: PORT,
    routes: {
      'POST   /api/auth/register'         : 'auth-service:3001',
      'POST   /api/auth/login'            : 'auth-service:3001',
      'GET    /api/auth/me'               : 'auth-service:3001',
      'POST   /api/auth/verify'           : 'auth-service:3001',
      'POST   /api/auth/logout'           : 'auth-service:3001',
      'GET    /api/users'                 : 'user-service:3002',
      'GET    /api/users/me'              : 'user-service:3002',
      'PATCH  /api/users/me'              : 'user-service:3002',
      'GET    /api/sessions'              : 'session-service:5002',
      'POST   /api/sessions'             : 'session-service:5002',
      'POST   /api/sessions/:id/join'     : 'session-service:5002',
      'GET    /api/matchmaking/search'    : 'matchmaking-service:8083',
      'GET    /api/matchmaking/recommend' : 'matchmaking-service:8083',
      'GET    /api/performances/:userId'  : 'performance-service:8084',
      'POST   /api/performances'          : 'performance-service:8084',
    },
  });
});

// ─────────────────────────────────────────────────
// Member 1 – Auth Service (port 3001)
// ─────────────────────────────────────────────────
app.use('/api/auth', proxy(AUTH_URL, { '^/api/auth': '/auth' }));

// ─────────────────────────────────────────────────
// Member 1 – User Service (port 3002)
// ─────────────────────────────────────────────────
app.use('/api/users', proxy(USER_URL, { '^/api/users': '/users' }));

// ─────────────────────────────────────────────────
// Member 2 – Session Service (port 5002)
// ─────────────────────────────────────────────────
app.use('/api/sessions', proxy(SESSION_URL, { '^/api/sessions': '/sessions' }));
app.use('/api/connections', proxy(SESSION_URL, { '^/api/connections': '/connections' }));

// ─────────────────────────────────────────────────
// Member 3 – Matchmaking Service (port 8083)
// ─────────────────────────────────────────────────
app.use('/api/matchmaking', proxy(MATCH_URL, { '^/api/matchmaking': '/matchmaking' }));

// ─────────────────────────────────────────────────
// Member 3 – Performance Service (port 8084)
// ─────────────────────────────────────────────────
app.use('/api/performances', proxy(PERF_URL, { '^/api/performances': '/performances' }));

// ── 404 ──
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`,
    hint: 'Check GET /health for available routes.',
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 =====================================');
  console.log(`   API GATEWAY running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log('======================================');
  console.log('');
});
