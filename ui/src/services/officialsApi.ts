import { environment } from '../config/environment';
import type { Official, ScrapeResult } from '../types/official';

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
export function getAllOfficials(): Promise<Official[]> {
  return apiFetch<Official[]>('/officials');
}

/** GET /api/officials/search?q=... */
export function searchOfficials(query: string): Promise<Official[]> {
  const params = new URLSearchParams({ q: query });
  return apiFetch<Official[]>(`/officials/search?${params}`);
}

/** POST /api/scraper/trigger — fetch Open States CSV and store in the database. */
export function triggerScrape(): Promise<ScrapeResult> {
  return apiFetch<ScrapeResult>('/scraper/trigger', { method: 'POST', body: '{}' });
}

export function getPartyClass(party: string): string {
  if (party.includes('Democrat')) return 'party-dem';
  if (party.includes('Republican')) return 'party-rep';
  return 'party-other';
}

export function getPartyLabel(party: string): string {
  if (party === 'Democratic') return 'D';
  if (party === 'Republican') return 'R';
  return party;
}
