import type { SourceAdapter } from "./types.js";
import {
  fetchText,
  mapCongressTermType,
  normalizeParty,
  parseOptionalDate,
  titleFromRoleType,
} from "./utils.js";
import type { CanonicalContact, CanonicalOfficial } from "../types/canonical-official.js";
import { parse as parseYaml } from "yaml";

interface CongressName {
  first: string;
  last: string;
  official_full?: string;
}

interface CongressTerm {
  type: string;
  start: string;
  end: string;
  state: string;
  district?: string | number;
  party?: string;
  url?: string;
  phone?: string;
  address?: string;
  contact_form?: string;
}

interface CongressLegislator {
  id?: { bioguide?: string };
  name: CongressName;
  terms: CongressTerm[];
}

export const congressLegislatorsAdapter: SourceAdapter = {
  source: "congress",
  description: "unitedstates/congress-legislators current members YAML",

  async fetch(state: string): Promise<CanonicalOfficial[]> {
    const yamlText = await fetchText(
      "https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.yaml",
    );
    const legislators = parseYaml(yamlText) as CongressLegislator[];
    const stateCode = state.toUpperCase();
    const records: CanonicalOfficial[] = [];

    for (const legislator of legislators) {
      const term = getCurrentTermForState(legislator.terms, stateCode);
      if (!term) continue;

      const mapped = mapCongressTermType(term.type);
      const externalId = legislator.id?.bioguide
        ? `bioguide:${legislator.id.bioguide}`
        : `${legislator.name.official_full ?? `${legislator.name.first} ${legislator.name.last}`}:${term.type}`;

      records.push({
        externalId,
        name: legislator.name.official_full ?? `${legislator.name.first} ${legislator.name.last}`,
        givenName: legislator.name.first,
        familyName: legislator.name.last,
        level: mapped.level,
        govBranch: mapped.govBranch,
        roleType: mapped.roleType,
        title: titleFromRoleType(mapped.roleType),
        party: normalizeParty(term.party),
        chamber: mapped.chamber,
        district: term.district != null ? String(term.district) : null,
        jurisdictionOcd: "ocd-jurisdiction/country:us/government",
        jurisdictionName: "United States",
        state: stateCode,
        imageUrl: null,
        termStart: parseOptionalDate(term.start),
        termEnd: parseOptionalDate(term.end),
        isAppointed: false,
        source: "congress",
        sourceUrl: term.url ?? null,
        rawPayload: { legislator, term },
        contacts: buildCongressContacts(term),
      });
    }

    return records;
  },
};

function getCurrentTermForState(
  terms: CongressTerm[],
  state: string,
): CongressTerm | null {
  const stateTerms = terms.filter((term) => term.state === state);
  return stateTerms.at(-1) ?? null;
}

function buildCongressContacts(term: CongressTerm): CanonicalContact[] {
  const contacts: CanonicalContact[] = [];

  if (term.phone) {
    contacts.push({ type: "phone", value: term.phone, label: "Capitol Office" });
  }
  if (term.address) {
    contacts.push({ type: "address", value: term.address, label: "Capitol Office" });
  }
  if (term.url) {
    contacts.push({ type: "website", value: term.url });
  }
  if (term.contact_form) {
    contacts.push({ type: "website", value: term.contact_form, label: "Contact Form" });
  }

  return contacts;
}
