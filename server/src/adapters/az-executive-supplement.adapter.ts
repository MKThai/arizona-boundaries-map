import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { SourceAdapter } from "./types.js";
import type { CanonicalOfficial } from "../types/canonical-official.js";

interface SupplementRecord {
  externalId: string;
  name: string;
  givenName?: string;
  familyName?: string;
  roleType: string;
  title: string;
  party?: string;
  imageUrl?: string;
  sourceUrl?: string;
}

const dataPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data/az-executive-supplement.json",
);

/** Local supplement for AZ state executives missing from openstates/people. */
export const azExecutiveSupplementAdapter: SourceAdapter = {
  source: "az_executive_supplement",
  description: "Local supplement for AZ state executives not in Open States YAML",

  async fetch(state: string): Promise<CanonicalOfficial[]> {
    if (state.toUpperCase() !== "AZ") return [];

    const raw = await readFile(dataPath, "utf8");
    const records = JSON.parse(raw) as SupplementRecord[];

    return records.map((record) => ({
      externalId: record.externalId,
      name: record.name,
      givenName: record.givenName ?? null,
      familyName: record.familyName ?? null,
      level: "state",
      govBranch: "executive",
      roleType: record.roleType,
      title: record.title,
      party: record.party ?? null,
      chamber: null,
      district: null,
      jurisdictionOcd: "ocd-jurisdiction/country:us/state:az/government",
      jurisdictionName: "AZ",
      state: "AZ",
      imageUrl: record.imageUrl ?? null,
      termStart: null,
      termEnd: null,
      isAppointed: false,
      source: "az_executive_supplement",
      sourceUrl: record.sourceUrl ?? null,
      contacts: [],
    }));
  },
};
