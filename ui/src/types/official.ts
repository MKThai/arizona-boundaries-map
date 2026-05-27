/**
 * Shared TypeScript types for data returned by the Express API.
 *
 * Keeping types in their own file (instead of inside the API module) makes them
 * easy to import from any component without circular dependencies.
 *
 * These shapes mirror the Prisma `Official` model on the server, minus timestamp
 * fields the UI doesn't display yet.
 */

/** A single elected official (executive or legislator). */
export interface Official {
  id: number;
  name: string;
  title: string;
  party: string;
  chamber: string | null;
  district: string | null;
  imageUrl: string | null;
  branch: string;
  state: string;
  source: string;
}

/** Response body from POST /api/scraper/trigger */
export interface ScrapeResult {
  status: string;
  recordCount: number;
  message: string;
}

/** Which tab is active on the Officials page. */
export type OfficialsTab = 'executive' | 'senate' | 'house';
