import prisma from "../db/index.js";
import type { OfficialFilters, OfficialGroup } from "../types/canonical-official.js";

const officialSelect = {
  id: true,
  externalId: true,
  name: true,
  givenName: true,
  familyName: true,
  level: true,
  govBranch: true,
  roleType: true,
  title: true,
  party: true,
  chamber: true,
  district: true,
  jurisdictionOcd: true,
  jurisdictionName: true,
  state: true,
  imageUrl: true,
  termStart: true,
  termEnd: true,
  isAppointed: true,
  source: true,
  sourceUrl: true,
  createdAt: true,
  updatedAt: true,
  contacts: {
    select: {
      id: true,
      type: true,
      value: true,
      label: true,
    },
  },
} as const;

function buildWhere(filters: OfficialFilters = {}) {
  return {
    ...(filters.state ? { state: filters.state.toUpperCase() } : {}),
    ...(filters.level ? { level: filters.level } : {}),
    ...(filters.govBranch ? { govBranch: filters.govBranch } : {}),
    ...(filters.chamber ? { chamber: filters.chamber } : {}),
  };
}

export async function getAllOfficials(filters: OfficialFilters = {}) {
  return prisma.official.findMany({
    where: buildWhere(filters),
    select: officialSelect,
    orderBy: [
      { level: "asc" },
      { govBranch: "asc" },
      { chamber: "asc" },
      { district: "asc" },
      { name: "asc" },
    ],
  });
}

export async function getOfficialsByGovBranch(
  govBranch: string,
  filters: OfficialFilters = {},
) {
  return prisma.official.findMany({
    where: { ...buildWhere(filters), govBranch },
    select: officialSelect,
    orderBy: { name: "asc" },
  });
}

export async function getOfficialsByChamber(
  chamber: string,
  filters: OfficialFilters = {},
) {
  return prisma.official.findMany({
    where: { ...buildWhere(filters), chamber },
    select: officialSelect,
    orderBy: [{ district: "asc" }, { name: "asc" }],
  });
}

export async function searchOfficials(query: string, filters: OfficialFilters = {}) {
  return prisma.official.findMany({
    where: {
      ...buildWhere(filters),
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { party: { contains: query, mode: "insensitive" } },
        { jurisdictionName: { contains: query, mode: "insensitive" } },
        { roleType: { contains: query, mode: "insensitive" } },
      ],
    },
    select: officialSelect,
    orderBy: { name: "asc" },
  });
}

const GROUP_DEFINITIONS = [
  {
    key: "federal-legislative-senate",
    label: "U.S. Senate",
    match: (official: { level: string; govBranch: string; chamber: string | null }) =>
      official.level === "federal" &&
      official.govBranch === "legislative" &&
      official.chamber === "senate",
  },
  {
    key: "federal-legislative-house",
    label: "U.S. House",
    match: (official: { level: string; govBranch: string; chamber: string | null }) =>
      official.level === "federal" &&
      official.govBranch === "legislative" &&
      official.chamber === "house",
  },
  {
    key: "state-executive",
    label: "State Executive",
    match: (official: { level: string; govBranch: string }) =>
      official.level === "state" && official.govBranch === "executive",
  },
  {
    key: "state-legislative-senate",
    label: "State Senate",
    match: (official: { level: string; govBranch: string; chamber: string | null }) =>
      official.level === "state" &&
      official.govBranch === "legislative" &&
      official.chamber === "senate",
  },
  {
    key: "state-legislative-house",
    label: "State House",
    match: (official: { level: string; govBranch: string; chamber: string | null }) =>
      official.level === "state" &&
      official.govBranch === "legislative" &&
      official.chamber === "house",
  },
  {
    key: "municipal-executive",
    label: "Mayors",
    match: (official: { level: string; roleType: string }) =>
      official.level === "municipal" && official.roleType === "mayor",
  },
] as const;

export async function getGroupedOfficials(
  filters: OfficialFilters = {},
): Promise<OfficialGroup[]> {
  const officials = await getAllOfficials(filters);

  return GROUP_DEFINITIONS.map(({ key, label, match }) => ({
    key,
    label,
    officials: officials
      .filter((official) => match(official))
      .map((official) => ({
        id: official.id,
        name: official.name,
        title: official.title,
        party: official.party,
        chamber: official.chamber,
        district: official.district,
        jurisdictionName: official.jurisdictionName,
        level: official.level,
        govBranch: official.govBranch,
        roleType: official.roleType,
        imageUrl: official.imageUrl,
        source: official.source,
      })),
  })).filter((group) => group.officials.length > 0);
}

export function parseOfficialFilters(query: Record<string, unknown>): OfficialFilters {
  return {
    state: typeof query.state === "string" ? query.state : undefined,
    level: typeof query.level === "string" ? (query.level as OfficialFilters["level"]) : undefined,
    govBranch:
      typeof query.govBranch === "string"
        ? (query.govBranch as OfficialFilters["govBranch"])
        : undefined,
    chamber: typeof query.chamber === "string" ? query.chamber : undefined,
  };
}
