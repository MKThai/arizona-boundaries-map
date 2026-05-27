import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration file.
 *
 * Vite is the build tool and dev server for this React app. It replaces Angular CLI.
 * - In development (`npm run dev`), Vite serves files with hot module replacement (HMR):
 *   when you save a file, the browser updates without a full page reload.
 * - In production (`npm run build`), Vite bundles and minifies everything into `dist/`.
 *
 * @see https://vite.dev/config/
 */
export default defineConfig({
  // The React plugin enables JSX/TSX and Fast Refresh during development.
  plugins: [react()],

  server: {
    // Keep port 4200 so the Express API's default CORS origin still works locally.
    port: 4200,
  },

  build: {
    // Cloudflare Pages expects static files in `dist/` (see docs/DEPLOY.md).
    outDir: 'dist',
  },
});
