import prisma from "../db/index.js";
import { STATE_OFFICIAL_ADAPTERS } from "../adapters/index.js";
import { replaceOfficialsForSource } from "./officials-persist.service.js";
import type {
  ScrapeRunResult,
  SourceScrapeResult,
} from "../types/canonical-official.js";

export async function scrapeStateOfficials(state = "AZ"): Promise<ScrapeRunResult> {
  const stateCode = state.toUpperCase();
  const sourceResults: SourceScrapeResult[] = [];
  let totalRecords = 0;

  for (const adapter of STATE_OFFICIAL_ADAPTERS) {
    const log = await prisma.scrapeLog.create({
      data: { source: adapter.source, status: "running" },
    });

    try {
      const records = await adapter.fetch(stateCode);
      const recordCount = await replaceOfficialsForSource(
        stateCode,
        adapter.source,
        records,
      );

      totalRecords += recordCount;
      const message = `Scraped ${recordCount} officials from ${adapter.source}`;

      await prisma.scrapeLog.update({
        where: { id: log.id },
        data: {
          status: "success",
          recordCount,
          message,
          finishedAt: new Date(),
        },
      });

      sourceResults.push({
        source: adapter.source,
        status: "success",
        recordCount,
        message,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      await prisma.scrapeLog.update({
        where: { id: log.id },
        data: {
          status: "error",
          message,
          finishedAt: new Date(),
        },
      });

      sourceResults.push({
        source: adapter.source,
        status: "error",
        recordCount: 0,
        message,
      });
    }
  }

  const failures = sourceResults.filter((result) => result.status === "error");
  const successes = sourceResults.filter((result) => result.status === "success");

  let status: ScrapeRunResult["status"] = "success";
  if (failures.length === sourceResults.length) {
    status = "error";
  } else if (failures.length > 0) {
    status = "partial";
  }

  const message =
    failures.length === 0
      ? `Scraped ${totalRecords} officials across ${successes.length} sources for ${stateCode}`
      : `${successes.length}/${sourceResults.length} sources succeeded (${totalRecords} records) for ${stateCode}`;

  return {
    status,
    totalRecords,
    recordCount: totalRecords,
    message,
    sources: sourceResults,
  };
}

/** @deprecated Use scrapeStateOfficials instead. */
export async function scrapeArizonaLegislators(): Promise<ScrapeRunResult> {
  return scrapeStateOfficials("AZ");
}

export async function getScrapeHistory(limit = 20) {
  return prisma.scrapeLog.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

export async function listDataSources() {
  return STATE_OFFICIAL_ADAPTERS.map((adapter) => ({
    source: adapter.source,
    description: adapter.description,
  }));
}
