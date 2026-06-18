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
