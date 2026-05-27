/// <reference types="vite/client" />

/**
 * TypeScript declarations for Vite's `import.meta.env`.
 *
 * Vite injects environment variables at build time. Only variables starting with
 * `VITE_` are included in the client bundle (a security feature — you don't want
 * to accidentally expose server secrets to the browser).
 */
interface ImportMetaEnv {
  /** Base URL for the Express API, e.g. http://localhost:3000/api */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
