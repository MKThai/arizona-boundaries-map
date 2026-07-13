import type { SourceAdapter } from "./types.js";
import {
  fetchGithubYamlDirectory,
  fetchText,
  jurisdictionNameFromOcd,
  mapOpenStatesRoleType,
  normalizeParty,
  parseOptionalDate,
  titleFromRoleType,
} from "./utils.js";
import type { CanonicalContact, CanonicalOfficial } from "../types/canonical-official.js";
import { parse as parseYaml } from "yaml";

interface OpenStatesRole {
  type: string;
  district?: string;
  jurisdiction?: string;
  start_date?: string;
  end_date?: string;
}

interface OpenStatesParty {
  name: string;
}

interface OpenStatesOffice {
  classification?: string;
  address?: string;
  voice?: string;
  fax?: string;
}

interface OpenStatesPerson {
  id: string;
  name: string;
  given_name?: string;
  family_name?: string;
  image?: string;
  email?: string;
  party?: OpenStatesParty[];
  roles?: OpenStatesRole[];
  offices?: OpenStatesOffice[];
  links?: Array<{ url: string } | string>;
  sources?: Array<{ url: string } | string>;
}

function createOpenStatesYamlAdapter(
  source: string,
  folder: "executive" | "municipalities",
): SourceAdapter {
  return {
    source,
    description: `Open States people YAML (${folder})`,

    async fetch(state: string): Promise<CanonicalOfficial[]> {
      const repoPath = `data/${state.toLowerCase()}/${folder}`;
      const fileUrls = await fetchGithubYamlDirectory(repoPath);
      const records: CanonicalOfficial[] = [];

      for (const fileUrl of fileUrls) {
        const yamlText = await fetchText(fileUrl);
        const person = parseYaml(yamlText) as OpenStatesPerson;
        const record = transformOpenStatesPerson(person, state, source);
        if (record) records.push(record);
      }

      return records;
    },
  };
}

export const openStatesExecutiveAdapter = createOpenStatesYamlAdapter(
  "openstates_executive",
  "executive",
);

export const openStatesMunicipalitiesAdapter = createOpenStatesYamlAdapter(
  "openstates_municipalities",
  "municipalities",
);

function transformOpenStatesPerson(
  person: OpenStatesPerson,
  state: string,
  source: string,
): CanonicalOfficial | null {
  const currentRole = getCurrentRole(person.roles);
  if (!currentRole) return null;

  const mapped = mapOpenStatesRoleType(currentRole.type);
  const party = normalizeParty(person.party?.at(-1)?.name);
  const jurisdictionOcd = currentRole.jurisdiction ?? null;
  const jurisdictionName =
    jurisdictionNameFromOcd(jurisdictionOcd) ??
    (mapped.level === "state" ? state.toUpperCase() : null);
  const sourceUrl = getFirstUrl(person.sources);
  const contacts = buildPersonContacts(person);

  return {
    externalId: person.id,
    name: person.name,
    givenName: person.given_name ?? null,
    familyName: person.family_name ?? null,
    level: mapped.level,
    govBranch: mapped.govBranch,
    roleType: mapped.roleType,
    title: titleFromRoleType(mapped.roleType),
    party,
    chamber: mapped.chamber,
    district: currentRole.district ?? null,
    jurisdictionOcd,
    jurisdictionName,
    state: state.toUpperCase(),
    imageUrl: person.image ?? null,
    termStart: parseOptionalDate(currentRole.start_date),
    termEnd: parseOptionalDate(currentRole.end_date),
    isAppointed: false,
    source,
    sourceUrl,
    rawPayload: person,
    contacts,
  };
}

function getCurrentRole(roles: OpenStatesRole[] | undefined): OpenStatesRole | null {
  if (!roles?.length) return null;

  const now = Date.now();
  const active = roles.find((role) => {
    if (!role.end_date) return true;
    return Date.parse(role.end_date) >= now;
  });

  return active ?? roles[roles.length - 1];
}

function getFirstUrl(entries: Array<{ url: string } | string> | undefined): string | null {
  if (!entries?.length) return null;
  const first = entries[0];
  return typeof first === "string" ? first : first.url;
}

function buildPersonContacts(person: OpenStatesPerson): CanonicalContact[] {
  const contacts: CanonicalContact[] = [];

  if (person.email) {
    contacts.push({ type: "email", value: person.email });
  }

  for (const office of person.offices ?? []) {
    const label = office.classification
      ? office.classification.charAt(0).toUpperCase() + office.classification.slice(1)
      : undefined;

    if (office.voice) {
      contacts.push({ type: "phone", value: office.voice, label });
    }
    if (office.address) {
      contacts.push({ type: "address", value: office.address, label });
    }
    if (office.fax) {
      contacts.push({ type: "fax", value: office.fax, label });
    }
  }

  for (const link of person.links ?? []) {
    const url = typeof link === "string" ? link : link.url;
    if (url) contacts.push({ type: "website", value: url });
  }

  return contacts;
}
