import { environment } from '../config/environment';
import type { Official, OfficialGroup, ScrapeResult } from '../types/official';

const baseUrl = environment.apiUrl;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/** GET /api/officials — all officials from the database. */
export function getAllOfficials(state = 'AZ'): Promise<Official[]> {
  const params = new URLSearchParams({ state });
  return apiFetch<Official[]>(`/officials?${params}`);
}

/** GET /api/officials/grouped — officials grouped for display. */
export function getGroupedOfficials(state = 'AZ'): Promise<OfficialGroup[]> {
  const params = new URLSearchParams({ state });
  return apiFetch<OfficialGroup[]>(`/officials/grouped?${params}`);
}

/** GET /api/officials/search?q=... */
export function searchOfficials(query: string, state = 'AZ'): Promise<Official[]> {
  const params = new URLSearchParams({ q: query, state });
  return apiFetch<Official[]>(`/officials/search?${params}`);
}

/** POST /api/scraper/trigger — fetch all sources and store in the database. */
export function triggerScrape(state = 'AZ'): Promise<ScrapeResult> {
  return apiFetch<ScrapeResult>('/scraper/trigger', {
    method: 'POST',
    body: JSON.stringify({ state }),
  });
}

export function getPartyClass(party: string | null): string {
  if (!party) return 'party-other';
  if (party.includes('Democrat')) return 'party-dem';
  if (party.includes('Republican')) return 'party-rep';
  return 'party-other';
}

export function getPartyLabel(party: string | null): string {
  if (!party) return '?';
  if (party === 'Democratic') return 'D';
  if (party === 'Republican') return 'R';
  return party.charAt(0).toUpperCase();
}
