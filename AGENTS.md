# AGENTS.md

## Project Overview

Rassed Plus (راصد بلس) — Academic AI advising system with student/advisor dashboards. Arabic RTL interface. Hackathon project.

## Commands

```bash
npm run dev          # Vite dev server (port 5173)
npm run build        # Production build → dist/
npm run lint         # ESLint (flat config, ESLint 9)
npm run preview      # Preview production build
```

Backend (optional — frontend works standalone with mock data):
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

## Architecture — Critical Pattern

**The frontend runs fully standalone without the backend.** Every API call in `src/services/api.js` follows this pattern:

1. Check `VITE_API_BASE_URL` env var — if empty, skip the fetch entirely
2. Try the real API endpoint
3. On failure or missing backend, fall back to `src/services/mockEngine.js`

This means: **never assume the backend is running.** All new API functions must include a mock fallback or the UI will break on Netlify/static deploy.

## Key Files

| File | Purpose |
|---|---|
| `src/App.jsx` | Shell: sidebar nav, routing by `activeTab` state, modals |
| `src/services/api.js` | API layer with mock fallback (the gateway for all data) |
| `src/services/mockEngine.js` | In-memory mock database + business logic |
| `src/services/aiService.js` | Groq API integration + local fallback AI |
| `src/contexts/UserContext.jsx` | Auth state (persisted to localStorage) |
| `src/contexts/SettingsContext.jsx` | Theme/accent/language preferences |
| `src/index.css` | Design system: CSS variables, glass components, animations |
| `src/App.css` | Layout: sidebar, header, cards, modals, advisor/student styles |
| `backend/main.py` | FastAPI server (74KB, comprehensive) |
| `backend/database.py` | SQLite schema + seed data |

## Environment Variables

| Variable | Purpose | Required |
|---|---|---|
| `VITE_API_BASE_URL` | Backend URL (e.g. `http://127.0.0.1:8000`). Empty = use mock engine | No |
| `VITE_GROQ_API_KEY` | Groq API key for real AI responses. Empty = use smart fallback | No |

## Design System Conventions

- **Single accent color**: Teal (`#2dd4bf` / `--brand-primary`). Do NOT introduce new accent colors.
- **Semantic colors are muted**: Success `#6ee7b7`, Warning `#fbbf24`, Danger `#fda4af`. Never use saturated red/blue/purple.
- **Backgrounds**: Slate (`#0f172a`, `#1e293b`). CSS vars: `--bg-primary`, `--bg-secondary`.
- **Glassmorphism**: `rgba(255,255,255,0.04)` with `backdrop-blur`. No colored glass backgrounds.
- **Font**: Tajawal (Google Fonts). All text is RTL Arabic.
- Light theme supported via `[data-theme="light"]` CSS overrides.

## Component Conventions

- **No showcase/catalog pages.** Features must be contextual and implicit within user workflows ("Show, Don't Tell").
- **No static text cards.** Every UI element must be wired to state and produce a real interaction.
- Components use inline styles for one-off colors; CSS classes for reusable patterns.
- Icon library: `lucide-react`. Do not add other icon packages.
- No router library — navigation is a simple `activeTab` state string in `App.jsx`.

## ESLint

- Flat config (ESLint 9), `eslint.config.js`
- `no-unused-vars` ignores uppercase identifiers (`varsIgnorePattern: '^[A-Z_]'`)

## Deployment

- **Netlify**: configured in `netlify.toml`. SPA redirect `/* → /index.html`.
- Build output: `dist/`
- No backend on Netlify — the app runs entirely on mock engine in production.

## Dead Files (safe to ignore)

- `src/components/RasedFeaturesGalaxy.jsx` — removed from routing, not imported. Legacy showcase.
- `src/components/FeaturesHub.jsx` — legacy feature catalog, not imported.
