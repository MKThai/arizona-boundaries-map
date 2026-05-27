# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

This is a full-stack monorepo with three layers:

| Layer | Directory | Tech | Port |
|-------|-----------|------|------|
| UI | `ui/` | React 19, Vite, SCSS | 4200 |
| Service/API | `server/` | Express + TypeScript, Prisma ORM | 3000 |
| Data | PostgreSQL 16 | via Docker Compose | 5432 |

The cron scraper lives inside the `server/` project (same Express process) and runs daily at 3 AM. It can also be triggered via `POST /api/scraper/trigger`.

> **Legacy**: The original static `index.html` (Leaflet map + Tailwind CSS) still exists in the repo root and can be served with `python3 -m http.server 8080` for quick reference, but the primary development workflow is the React + Express stack.

### Cloud deployment (Tier A)

Neon (Postgres) + Render (API) + Cloudflare Pages (UI). See [docs/DEPLOY.md](docs/DEPLOY.md).

### Running locally

1. **Start PostgreSQL**: `docker compose up -d` (from workspace root)
2. **Start API server**: `cd server && npm run dev`
3. **Start React UI**: `cd ui && npm run dev`

### Key commands

| Task | Command | Directory |
|------|---------|-----------|
| Server lint | `npm run lint` | `server/` |
| UI lint | `npm run lint` | `ui/` |
| DB migrate | `npm run db:migrate` | `server/` |
| DB seed | `npm run db:seed` | `server/` |
| Trigger scraper | `curl -X POST http://localhost:3000/api/scraper/trigger` | anywhere |
| Server build | `npm run build` | `server/` |
| UI build | `npm run build` | `ui/` |

### Important notes

- **Docker is required** for local PostgreSQL. Start dockerd before `docker compose up`.
- The React UI uses Vite on port 4200 (matches the API's default CORS origin).
- The `.env` file in `server/` contains the local database URL: `postgresql://azuser:azpass@localhost:5432/arizona_boundaries`
- The Express server uses `tsx watch` for hot-reload in dev mode.
- After pulling changes, if Prisma schema changed, run `npm run db:migrate` in `server/` to sync the DB.
- The cron job (Open States scrape) replaces all `source: "openstates"` records on each run; executive officials (`source: "manual"`) are preserved.
