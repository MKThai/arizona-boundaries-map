/**
 * Application configuration — where the UI finds the backend API.
 *
 * In development, Vite loads `.env.development` (see repo root `ui/.env.development`).
 * In production (Cloudflare Pages), `scripts/write-ui-env.mjs` writes `.env.production`
 * from the `API_BASE_URL` environment variable before `vite build` runs.
 *
 * This replaces the old Angular `environment.ts` / `environment.production.ts` files.
 */
export const environment = {
  /**
   * `import.meta.env` is a Vite-specific object. At build time, Vite replaces
   * `import.meta.env.VITE_API_URL` with the actual string value.
   */
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
};
