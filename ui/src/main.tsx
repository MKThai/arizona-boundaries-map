/**
 * Application entry point — the first TypeScript file that runs in the browser.
 *
 * Responsibilities:
 * 1. Import global CSS.
 * 2. Find the `#root` div in index.html.
 * 3. Render the root React component (`<App />`) into that div.
 *
 * In Angular, `main.ts` called `bootstrapApplication(App, appConfig)`.
 * React uses `createRoot` from `react-dom/client` instead.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.scss';

// `document.getElementById` returns `HTMLElement | null`, so we assert non-null with `!`.
// If #root were missing, the app would crash here — which is intentional (fail fast).
createRoot(document.getElementById('root')!).render(
  /**
   * StrictMode is a development-only wrapper that double-invokes some lifecycle
   * methods to help catch bugs. It has no effect in production builds.
   */
  <StrictMode>
    {/*
      BrowserRouter enables client-side routing (URLs like / and /admin without
      full page reloads). It listens to the browser history API and renders the
      matching route component inside <App />.
    */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
