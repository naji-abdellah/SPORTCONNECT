# SportConnect Frontend 🏆

> **Member 4** — Frontend & Integration  
> Cloud Native project · React SPA · Connected to microservices via API Gateway

---

## Architecture

```
sportconnect/
├── src/
│   ├── pages/
│   │   ├── Landing.js       # Public homepage (hero, features, CTA)
│   │   ├── Auth.js          # Login + Register forms
│   │   ├── Dashboard.js     # Authenticated home (stats, sessions, matches)
│   │   ├── Sessions.js      # Browse & create training sessions
│   │   ├── Partners.js      # AI-powered matchmaking discovery
│   │   └── Performance.js   # Activity log & weekly chart
│   ├── components/
│   │   └── Navbar.js        # Responsive navigation
│   ├── services/
│   │   └── api.js           # API client for all 3 microservices
│   ├── context/
│   │   └── AuthContext.js   # JWT auth state management
│   └── firebase.js          # Firebase config
```

---

## Setup

```bash
npm install
REACT_APP_API_GATEWAY_URL=http://localhost:3000/api npm start
```

---

## Microservice Integration

| Service       | Owner    | Endpoints used |
|---------------|----------|----------------|
| Auth Service  | Membre 1 | POST `/auth/login`, POST `/auth/register`, GET `/users/me` |
| Session Svc   | Membre 2 | GET/POST/PUT/DELETE `/sessions`, POST `/sessions/:id/join` |
| Matchmaking   | Membre 3 | GET `/matchmaking/partners`, GET `/matchmaking/matches` |
| Performance   | Membre 3 | GET/POST `/performance/activities`, GET `/performance/stats` |

### Environment Variables

```env
REACT_APP_API_GATEWAY_URL=https://your-api-gateway-url.com/api
```

---

## Firebase

The `serviceAccountKey.json` is configured for project `sportconnect-818cd`.  
The frontend uses the Firebase SDK for real-time features. Update `src/firebase.js` with your web API key from the Firebase Console.

---

## Features

- **Landing Page** — Bold hero, sport ticker, stats, feature showcase, CTA
- **Auth** — Login + Register with JWT storage, protected routes
- **Dashboard** — Personalized greeting, stat cards, upcoming sessions, partner suggestions
- **Sessions** — Browse with search + filter, join sessions, create new sessions (modal)
- **Partners** — Matchmaking grid with compatibility score rings, detail modal + connect flow
- **Performance** — Activity log, weekly bar chart, log new activities

---

## Design System

- **Font**: Bebas Neue (display) + Barlow Condensed (UI) + Barlow (body)
- **Colors**: `#E8FF3C` accent (lime-yellow), `#080808` background, `#FF3C3C` danger
- **Inspiration**: Bold, dark, athletic — Stryda / Rhinalitics / Ironclad Titans aesthetic

---

## Member Repositories

- **Membre 1 (Auth/User)**: https://github.com/abde-ens/sportconnect.git
- **Membre 2 (Sessions)**: https://github.com/achraf41/cloud-.git  
- **Membre 3 (Matchmaking/Performance)**: https://github.com/kacemamine/SportConnect-Plateforme-intelligente-pour-sportifs.git
- **Membre 4 (Frontend)**: *this repo*
