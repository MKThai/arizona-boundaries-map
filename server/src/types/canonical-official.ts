export type OfficialLevel = "federal" | "state" | "county" | "municipal";
export type GovBranch = "executive" | "legislative" | "judicial";

export interface CanonicalContact {
  type: string;
  value: string;
  label?: string;
}

/** Normalized official record produced by every source adapter. */
export interface CanonicalOfficial {
  externalId: string;
  name: string;
  givenName: string | null;
  familyName: string | null;
  level: OfficialLevel;
  govBranch: GovBranch;
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
  rawPayload?: unknown;
  contacts: CanonicalContact[];
}

export interface SourceAdapterResult {
  source: string;
  records: CanonicalOfficial[];
}

export interface SourceScrapeResult {
  source: string;
  status: "success" | "error";
  recordCount: number;
  message: string;
}

export interface ScrapeRunResult {
  status: "success" | "partial" | "error";
  totalRecords: number;
  recordCount: number;
  message: string;
  sources: SourceScrapeResult[];
}

export interface OfficialFilters {
  state?: string;
  level?: OfficialLevel;
  govBranch?: GovBranch;
  chamber?: string;
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
