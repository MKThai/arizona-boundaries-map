import prisma from "../db/index.js";
import type { CanonicalOfficial } from "../types/canonical-official.js";

export async function replaceOfficialsForSource(
  state: string,
  source: string,
  records: CanonicalOfficial[],
): Promise<number> {
  await prisma.$transaction(async (tx) => {
    await tx.official.deleteMany({
      where: { state: state.toUpperCase(), source },
    });

    for (const record of records) {
      await tx.official.create({
        data: {
          externalId: record.externalId,
          name: record.name,
          givenName: record.givenName,
          familyName: record.familyName,
          level: record.level,
          govBranch: record.govBranch,
          roleType: record.roleType,
          title: record.title,
          party: record.party,
          chamber: record.chamber,
          district: record.district,
          jurisdictionOcd: record.jurisdictionOcd,
          jurisdictionName: record.jurisdictionName,
          state: record.state.toUpperCase(),
          imageUrl: record.imageUrl,
          termStart: record.termStart ? new Date(record.termStart) : null,
          termEnd: record.termEnd ? new Date(record.termEnd) : null,
          isAppointed: record.isAppointed,
          source: record.source,
          sourceUrl: record.sourceUrl,
          rawPayload: record.rawPayload ?? undefined,
          contacts: {
            create: record.contacts.map((contact) => ({
              type: contact.type,
              value: contact.value,
              label: contact.label ?? null,
            })),
          },
        },
      });
    }
  });

  return records.length;
}
