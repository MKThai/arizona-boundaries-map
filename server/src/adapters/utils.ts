import type { GovBranch, OfficialLevel } from "../types/canonical-official.js";

const ROLE_TITLES: Record<string, string> = {
  governor: "Governor",
  lt_governor: "Lieutenant Governor",
  mayor: "Mayor",
  upper: "State Senator",
  lower: "State Representative",
  sen: "U.S. Senator",
  rep: "U.S. Representative",
};

export function parseCsv<T extends Record<string, string>>(
  csvText: string,
): T[] {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const obj: Record<string, string> = {};
    headers.forEach((header, index) => {
      obj[header.trim()] = (values[index] || "").replace(/"/g, "").trim();
    });
    return obj as T;
  });
}

export function normalizeParty(party: string | null | undefined): string | null {
  if (!party) return null;
  const trimmed = party.trim();
  if (trimmed === "Democrat") return "Democratic";
  if (trimmed === "Democratic") return "Democratic";
  if (trimmed === "Republican") return "Republican";
  if (trimmed === "Independent") return "Independent";
  if (trimmed === "Unknown") return null;
  return trimmed;
}

export function titleFromRoleType(roleType: string): string {
  return ROLE_TITLES[roleType] ?? roleType.replace(/_/g, " ");
}

export function jurisdictionNameFromOcd(ocd: string | null | undefined): string | null {
  if (!ocd) return null;

  const placeMatch = ocd.match(/place:([^/]+)/);
  if (placeMatch) {
    return placeMatch[1]
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  const countyMatch = ocd.match(/county:([^/]+)/);
  if (countyMatch) {
    const county = countyMatch[1]
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
    return `${county} County`;
  }

  const stateMatch = ocd.match(/state:([a-z]{2})/);
  if (stateMatch && ocd.includes("/government")) {
    return stateMatch[1].toUpperCase();
  }

  return null;
}

export function parseOptionalDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
}

export function mapOpenStatesRoleType(roleType: string): {
  level: OfficialLevel;
  govBranch: GovBranch;
  roleType: string;
  chamber: string | null;
} {
  switch (roleType) {
    case "upper":
      return { level: "state", govBranch: "legislative", roleType: "senator", chamber: "senate" };
    case "lower":
      return { level: "state", govBranch: "legislative", roleType: "representative", chamber: "house" };
    case "governor":
    case "lt_governor":
      return { level: "state", govBranch: "executive", roleType: roleType, chamber: null };
    case "mayor":
      return { level: "municipal", govBranch: "executive", roleType: "mayor", chamber: null };
    default:
      return { level: "state", govBranch: "executive", roleType: roleType, chamber: null };
  }
}

export function mapCongressTermType(type: string): {
  level: OfficialLevel;
  govBranch: GovBranch;
  roleType: string;
  chamber: string | null;
} {
  if (type === "sen") {
    return { level: "federal", govBranch: "legislative", roleType: "senator", chamber: "senate" };
  }
  return { level: "federal", govBranch: "legislative", roleType: "representative", chamber: "house" };
}

export async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText} (${url})`);
  }
  return response.text();
}

interface GithubContentEntry {
  name: string;
  type: string;
  download_url: string | null;
}

export async function fetchGithubYamlDirectory(
  repoPath: string,
): Promise<string[]> {
  const url = `https://api.github.com/repos/openstates/people/contents/${repoPath}?ref=main`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
  }

  const entries = (await response.json()) as GithubContentEntry[];
  return entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".yml"))
    .map((entry) => entry.download_url)
    .filter((downloadUrl): downloadUrl is string => Boolean(downloadUrl));
}
