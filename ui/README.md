# Arizona Boundaries — React UI

This directory contains the **React + Vite** frontend for browsing Arizona officials and triggering the data scraper.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:4200](http://localhost:4200). The API server must be running on port 3000 (`cd server && npm run dev`).

## Project structure

```
src/
├── main.tsx              # App entry point — mounts React into #root
├── App.tsx               # Root component with route definitions
├── config/environment.ts # API URL from Vite env vars
├── types/official.ts     # TypeScript interfaces shared across components
├── services/officialsApi.ts  # fetch() wrappers for the Express API
└── components/
    ├── Layout.tsx        # Navbar + <Outlet /> for child routes
    ├── OfficialsList.tsx # Home page — tabs, search, official cards
    └── PoliticalSnapshot.tsx  # Admin page — scraper trigger button
```

Each file includes comments explaining the React concepts it uses. Start with `main.tsx` and follow the imports.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 4200, hot reload) |
| `npm run build` | Type-check + production bundle to `dist/` |
| `npm run build:deploy` | Write prod env from `API_BASE_URL`, then build |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |

## Environment variables

| Variable | Where set | Example |
|----------|-----------|---------|
| `VITE_API_URL` | `.env.development` (local) | `http://localhost:3000/api` |
| `VITE_API_URL` | `.env.production` (generated at deploy) | `https://your-api.onrender.com/api` |

Only variables prefixed with `VITE_` are exposed to browser code.

## Deployment

See [docs/DEPLOY.md](../docs/DEPLOY.md). Cloudflare Pages build output directory is `dist/`.
