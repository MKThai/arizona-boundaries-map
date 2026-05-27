# Tier A cloud deployment

This project uses a simple, low-ops stack:

| Layer | Provider | Role |
|-------|----------|------|
| Database | [Neon](https://neon.tech) | Managed PostgreSQL 16 |
| API + cron | [Render](https://render.com) | Express (`server/`) |
| UI | [Cloudflare Pages](https://pages.cloudflare.com) | Angular static build (`ui/`) |

Local development is unchanged: Docker Compose for Postgres, `npm run dev` in `server/`, `ng serve` in `ui/`.

## Prerequisites

- GitHub repo with this code pushed
- Free accounts on Neon, Render, and Cloudflare
- ~30 minutes for first-time wiring

## 1. Database (Neon)

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Create a database (default name is fine).
3. Copy the **connection string** (use the direct host, not the pooler, for Render’s always-on web service).
4. Append `?sslmode=require` if it is not already present.

Keep this URL secret; you will paste it into Render as `DATABASE_URL`.

## 2. API (Render)

### Option A — Blueprint (recommended)

1. In [Render Dashboard](https://dashboard.render.com) → **Blueprints** → **New Blueprint Instance**.
2. Connect this GitHub repository.
3. Render reads [`render.yaml`](../render.yaml) and creates `arizona-boundaries-api`.
4. When prompted, set environment variables:
   - `DATABASE_URL` — Neon connection string from step 1
   - `CORS_ORIGINS` — your Cloudflare Pages URL (set after step 3), e.g. `https://arizona-boundaries.pages.dev`  
     You can add `http://localhost:4200` for local dev:  
     `https://arizona-boundaries.pages.dev,http://localhost:4200`
5. Deploy. On first boot, `prisma migrate deploy` runs automatically via `start:production`.

### Option B — Manual web service

| Setting | Value |
|---------|--------|
| Root directory | `server` |
| Build command | `npm ci && npm run build` |
| Start command | `npm run start:production` |
| Health check path | `/api/health` |

### Seed data (one time)

After the first successful deploy, open **Render → Shell** for the service and run:

```bash
npm run db:seed
```

### Verify API

```bash
curl https://YOUR-SERVICE.onrender.com/api/health
curl https://YOUR-SERVICE.onrender.com/api/officials
```

## 3. UI (Cloudflare Pages)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select this repository.
3. Build settings:

| Setting | Value |
|---------|--------|
| Framework preset | None |
| Root directory | `ui` |
| Build command | `npm ci && npm run build:deploy` |
| Build output directory | `dist` |

4. Environment variables (Production):

| Name | Example |
|------|---------|
| `API_BASE_URL` | `https://arizona-boundaries-api.onrender.com/api` |
| `NODE_VERSION` | `22` |

`build:deploy` runs [`scripts/write-ui-env.mjs`](../scripts/write-ui-env.mjs), which writes `environment.production.ts` from `API_BASE_URL`, then runs `ng build`.

5. Deploy. Copy the `*.pages.dev` URL.
6. Update Render `CORS_ORIGINS` to include that URL (comma-separated if you have several).

SPA routing is handled by [`ui/public/_redirects`](../ui/public/_redirects).

## 4. Daily scraper on Render Free

Render Free services **spin down after inactivity**. The in-process cron at 3:00 AM may not run reliably.

**Workaround:** use an external scheduler to call the trigger endpoint once per day:

- [cron-job.org](https://cron-job.org) (free)
- Schedule: `0 3 * * *` (3:00 AM in your chosen timezone)
- URL: `POST https://YOUR-SERVICE.onrender.com/api/scraper/trigger`

Optional: protect this route later with a shared secret header.

## 5. Environment reference

### Server (`server/`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL URL |
| `PORT` | No | Set by Render automatically |
| `CORS_ORIGINS` | Yes (prod) | Comma-separated frontend origins |

### UI build (Cloudflare)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_BASE_URL` | Yes | Full API prefix, e.g. `https://….onrender.com/api` |

## 6. CI

GitHub Actions in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs lint and production builds on push/PR.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| UI loads but officials empty / CORS error | `CORS_ORIGINS` on Render includes exact Pages URL (scheme + host, no trailing slash) |
| API 502 on cold start | Render Free cold start; retry after ~30s |
| `prisma migrate` failed | `DATABASE_URL` correct and Neon project active |
| Wrong API in production build | Cloudflare `API_BASE_URL` and redeploy UI |

## Cost notes

All three services offer free tiers suitable for demos and low traffic. Upgrade Neon/Render/Cloudflare when you need higher limits, custom domains with SLA, or always-on cron without external pings.
