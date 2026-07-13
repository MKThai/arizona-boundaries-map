import type { SourceAdapter } from "./types.js";
import {
  fetchText,
  mapOpenStatesRoleType,
  normalizeParty,
  parseCsv,
  titleFromRoleType,
} from "./utils.js";
import type { CanonicalOfficial } from "../types/canonical-official.js";

interface OpenStatesCsvRow extends Record<string, string> {
  id: string;
  name: string;
  current_party: string;
  current_chamber: string;
  current_district: string;
  given_name: string;
  family_name: string;
  image: string;
  email: string;
  capitol_voice: string;
  capitol_address: string;
  district_voice: string;
  district_address: string;
  links: string;
  sources: string;
}

export const openStatesCsvAdapter: SourceAdapter = {
  source: "openstates_legislators",
  description: "Open States nightly CSV for current state legislators",

  async fetch(state: string): Promise<CanonicalOfficial[]> {
    const csvText = await fetchText(
      `https://data.openstates.org/people/current/${state.toLowerCase()}.csv`,
    );
    const legislators = parseCsv<OpenStatesCsvRow>(csvText);

    return legislators.map((legislator) => {
      const roleType = legislator.current_chamber === "upper" ? "upper" : "lower";
      const mapped = mapOpenStatesRoleType(roleType);
      const contacts = buildCsvContacts(legislator);
      const sourceUrl = legislator.sources?.split(";")[0]?.trim() || null;

      return {
        externalId: legislator.id,
        name: legislator.name,
        givenName: legislator.given_name || null,
        familyName: legislator.family_name || null,
        level: mapped.level,
        govBranch: mapped.govBranch,
        roleType: mapped.roleType,
        title: titleFromRoleType(mapped.roleType),
        party: normalizeParty(legislator.current_party),
        chamber: mapped.chamber,
        district: legislator.current_district || null,
        jurisdictionOcd: `ocd-jurisdiction/country:us/state:${state.toLowerCase()}/government`,
        jurisdictionName: state.toUpperCase(),
        state: state.toUpperCase(),
        imageUrl: legislator.image || null,
        termStart: null,
        termEnd: null,
        isAppointed: false,
        source: "openstates_legislators",
        sourceUrl,
        rawPayload: legislator,
        contacts,
      };
    });
  },
};

function buildCsvContacts(legislator: OpenStatesCsvRow) {
  const contacts = [];

  if (legislator.email) {
    contacts.push({ type: "email", value: legislator.email });
  }
  if (legislator.capitol_voice) {
    contacts.push({
      type: "phone",
      value: legislator.capitol_voice,
      label: "Capitol Office",
    });
  }
  if (legislator.capitol_address) {
    contacts.push({
      type: "address",
      value: legislator.capitol_address,
      label: "Capitol Office",
    });
  }
  if (legislator.district_voice) {
    contacts.push({
      type: "phone",
      value: legislator.district_voice,
      label: "District Office",
    });
  }
  if (legislator.district_address) {
    contacts.push({
      type: "address",
      value: legislator.district_address,
      label: "District Office",
    });
  }
  if (legislator.links) {
    for (const link of legislator.links.split(";")) {
      const trimmed = link.trim();
      if (trimmed) contacts.push({ type: "website", value: trimmed });
    }
  }

  return contacts;
}
