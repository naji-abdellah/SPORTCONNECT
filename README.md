# SportConnect — Docker Setup 🐳

Full microservices stack running with a single command.

## Architecture

```
Browser :80
  └── Frontend (React + nginx)
        └── API Gateway :3000
              ├── /api/auth/*          → auth-service      :3001  (Member 1)
              ├── /api/users/*         → user-service      :3002  (Member 1)
              ├── /api/sessions/*      → session-service   :5002  (Member 2)
              ├── /api/matchmaking/*   → matchmaking-svc   :8083  (Member 3)
              └── /api/performances/*  → performance-svc   :8084  (Member 3)

Databases:
  MongoDB   :27017  ← session-service
  PostgreSQL :5432  ← matchmaking + performance services
```

---

## Prerequisites

- Docker Desktop installed and running
- `serviceAccountKey.json` from Firebase (place it in this folder)

---

## Setup (5 steps)

### Step 1 — Place each microservice's code

```
sportconnect-docker/
├── auth-service/        ← paste contents of Member 1's auth-service folder here
├── user-service/        ← paste contents of Member 1's user-service folder here
├── session-service/     ← paste contents of Member 2's session-service folder here
├── matchmaking-service/ ← paste contents of Member 3's matchmaking-service folder here
├── performance-service/ ← paste contents of Member 3's performance-service folder here
├── frontend/            ← paste contents of Member 4's sportconnect React app here
├── api-gateway/         ← already provided (index.js + package.json + Dockerfile)
├── serviceAccountKey.json  ← place here
└── docker-compose.yml
```

### Step 2 — Create your .env file

```bash
cp .env.example .env
```

Then edit `.env` and add your Firebase Web API Key:
- Go to Firebase Console → Project Settings → General
- Copy the **Web API Key** (different from the service account!)
- Paste it as `FIREBASE_API_KEY=...`

### Step 3 — Build and start everything

```bash
docker-compose up --build
```

First build takes ~5-10 minutes (downloads Java, Maven, Node images).
Subsequent starts are fast (images are cached).

### Step 4 — Verify everything is running

```bash
docker-compose ps
```

All services should show `Up`. Then test the health endpoints:

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API Gateway | http://localhost:3000/health |
| Auth Service | http://localhost:3001/health |
| User Service | http://localhost:3002/health |
| Session Service | http://localhost:5002 |
| Matchmaking | http://localhost:8083/matchmaking/search |
| Performance | http://localhost:8084/performances/1 |

### Step 5 — Test the full flow

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sport.com","password":"test123","displayName":"Test User","sportPrefere":"football","niveau":"intermédiaire","localisation":"Casablanca"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@sport.com","password":"test123"}'

# Get sessions (use the token from login)
curl http://localhost:3000/api/sessions \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Useful commands

```bash
# Start in background
docker-compose up -d --build

# See logs of a specific service
docker-compose logs -f auth-service
docker-compose logs -f session-service
docker-compose logs -f matchmaking-service

# Restart one service
docker-compose restart api-gateway

# Stop everything
docker-compose down

# Stop and remove all data (databases too)
docker-compose down -v
```

---

## Route Map

All routes go through the API Gateway at `http://localhost:3000`

### Auth (Member 1)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns Firebase idToken |
| GET | `/api/auth/me` | Get Firebase auth profile |
| POST | `/api/auth/verify` | Verify token validity |
| POST | `/api/auth/logout` | Revoke tokens |

### Users (Member 1)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/users/me` | Get my Firestore profile |
| POST | `/api/users` | Create my profile |
| PATCH | `/api/users/me` | Update my profile |
| GET | `/api/users?sport=football` | List users by sport |
| GET | `/api/users/:uid` | Get another user's profile |

### Sessions (Member 2)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/sessions` | List all sessions |
| POST | `/api/sessions` | Create a session |
| GET | `/api/sessions/:id` | Get session details |
| PUT | `/api/sessions/:id` | Update session |
| POST | `/api/sessions/:id/join` | Join a session |
| POST | `/api/sessions/:id/leave` | Leave a session |
| DELETE | `/api/sessions/:id` | Delete session |

### Matchmaking (Member 3)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/matchmaking/search?sport=football&level=...` | Search partners |
| GET | `/api/matchmaking/recommend/:userId` | AI recommendations |
| GET | `/api/matchmaking/nearby/:userId` | Nearby users |

### Performance (Member 3)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/performances` | Log an activity |
| GET | `/api/performances/:userId` | Get user activities |
| GET | `/api/performances/stats/:userId` | Get performance stats |

---

## Notes

- **Firebase Auth token**: After login, you get a `idToken` (JWT). Include it in every protected request as `Authorization: Bearer <idToken>`
- **serviceAccountKey.json**: Used by auth-service and user-service. It's mounted as a read-only volume — never baked into the image
- **Spring Boot services** take ~30-60 seconds to start — this is normal (JVM startup time)
- **PostgreSQL**: Both matchmaking and performance services share the same `sportconnect` database but use different tables

---

## Troubleshooting

**Spring Boot won't connect to PostgreSQL?**
Wait 60 seconds after `docker-compose up` — the JVM takes time to start. Check with `docker-compose logs matchmaking-service`.

**auth-service crashes with "serviceAccountKey.json not found"?**
Make sure `serviceAccountKey.json` is in the `sportconnect-docker/` root folder (next to `docker-compose.yml`).

**Session service won't connect to MongoDB?**
MongoDB needs a few seconds to initialize. The service will auto-restart and reconnect.
