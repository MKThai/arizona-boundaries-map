/**
 * API client for the Arizona Boundaries Express server.
 *
 * In Angular, this logic lived in `OfficialsService` and used HttpClient + RxJS Observables.
 * In React we use the browser's built-in `fetch()` API with async/await instead.
 *
 * Each function returns a Promise — the modern way to handle asynchronous HTTP calls.
 * Components call these functions inside `useEffect` (for reads) or event handlers (for writes).
 */
import { environment } from '../config/environment';
import type { Official, ScrapeResult } from '../types/official';

/** Base path for all API calls, e.g. http://localhost:3000/api */
const baseUrl = environment.apiUrl;

/**
 * Helper that wraps `fetch` with consistent error handling.
 *
 * - Automatically parses JSON responses.
 * - Throws if the HTTP status is not OK (4xx/5xx), so callers can use try/catch.
 */
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    // Default to JSON requests; callers can override headers in `options`.
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/** GET /api/officials — all officials (available but not used by the UI yet). */
export function getAllOfficials(): Promise<Official[]> {
  return apiFetch<Official[]>('/officials');
}

/** GET /api/officials/branch/:branch — e.g. executive officials only. */
export function getOfficialsByBranch(branch: string): Promise<Official[]> {
  return apiFetch<Official[]>(`/officials/branch/${branch}`);
}

/** GET /api/officials/chamber/:chamber — senate or house legislators. */
export function getOfficialsByChamber(chamber: string): Promise<Official[]> {
  return apiFetch<Official[]>(`/officials/chamber/${chamber}`);
}

/**
 * GET /api/officials/search?q=...
 *
 * `encodeURIComponent` safely escapes special characters in the search query
 * so URLs like `?q=O'Brien` don't break the request.
 */
export function searchOfficials(query: string): Promise<Official[]> {
  const params = new URLSearchParams({ q: query });
  return apiFetch<Official[]>(`/officials/search?${params}`);
}

/** POST /api/scraper/trigger — manually run the Open States legislator scrape. */
export function triggerScrape(): Promise<ScrapeResult> {
  return apiFetch<ScrapeResult>('/scraper/trigger', { method: 'POST', body: '{}' });
}

/**
 * Maps a party name string to a CSS class for badge coloring.
 *
 * Pure functions like this don't need to live inside a component — keeping them
 * here makes them easy to test and reuse.
 */
export function getPartyClass(party: string): string {
  if (party.includes('Democrat')) return 'party-dem';
  if (party.includes('Republican')) return 'party-rep';
  return 'party-other';
}

/** Short label shown in the party badge (D / R / full name for others). */
export function getPartyLabel(party: string): string {
  if (party === 'Democratic') return 'D';
  if (party === 'Republican') return 'R';
  return party;
}
