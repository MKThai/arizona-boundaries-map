/** Contact info attached to an official. */
export interface OfficialContact {
  id: number;
  type: string;
  value: string;
  label: string | null;
}

/** A single elected or appointed official in canonical form. */
export interface Official {
  id: number;
  externalId: string | null;
  name: string;
  givenName: string | null;
  familyName: string | null;
  level: string;
  govBranch: string;
  roleType: string;
  title: string;
  party: string | null;
  chamber: string | null;
  district: string | null;
  jurisdictionOcd: string | null;
  jurisdictionName: string | null;
  state: string;
  imageUrl: string | null;
  termStart: string | null;
  termEnd: string | null;
  isAppointed: boolean;
  source: string;
  sourceUrl: string | null;
  contacts?: OfficialContact[];
}

export interface OfficialGroup {
  key: string;
  label: string;
  officials: Array<{
    id: number;
    name: string;
    title: string;
    party: string | null;
    chamber: string | null;
    district: string | null;
    jurisdictionName: string | null;
    level: string;
    govBranch: string;
    roleType: string;
    imageUrl: string | null;
    source: string;
  }>;
}

export interface SourceScrapeResult {
  source: string;
  status: string;
  recordCount: number;
  message: string;
}

/** Response body from POST /api/scraper/trigger */
export interface ScrapeResult {
  status: string;
  recordCount: number;
  totalRecords: number;
  message: string;
  sources?: SourceScrapeResult[];
}
