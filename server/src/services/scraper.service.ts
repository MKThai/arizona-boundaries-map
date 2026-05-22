import prisma from "../db/index.js";

interface LegislatorRecord {
  name: string;
  current_party: string;
  current_chamber: string;
  current_district: string;
  image: string;
}

function parseCSV(csvText: string): LegislatorRecord[] {
  const lines = csvText.trim().split(/\r?\n/);
  const headers = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || "").replace(/"/g, "").trim();
    });
    return obj as unknown as LegislatorRecord;
  });
}

export async function scrapeArizonaLegislators(): Promise<{
  status: string;
  recordCount: number;
  message: string;
}> {
  const log = await prisma.scrapeLog.create({
    data: { source: "openstates_az", status: "running" },
  });

  try {
    const response = await fetch(
      "https://data.openstates.org/people/current/az.csv"
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvText = await response.text();
    const legislators = parseCSV(csvText);

    await prisma.official.deleteMany({
      where: { source: "openstates" },
    });

    const records = legislators.map((leg) => {
      const chamber = leg.current_chamber === "upper" ? "senate" : "house";
      return {
        name: leg.name,
        title: chamber === "senate" ? "Senator" : "Representative",
        party: leg.current_party || "Unknown",
        chamber,
        district: leg.current_district,
        branch: "legislative",
        imageUrl: leg.image || null,
        state: "AZ",
        source: "openstates",
      };
    });

    await prisma.official.createMany({ data: records });
    const upsertCount = records.length;

    await prisma.scrapeLog.update({
      where: { id: log.id },
      data: {
        status: "success",
        recordCount: upsertCount,
        message: `Scraped ${upsertCount} legislators from Open States`,
        finishedAt: new Date(),
      },
    });

    return {
      status: "success",
      recordCount: upsertCount,
      message: `Scraped ${upsertCount} legislators`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.scrapeLog.update({
      where: { id: log.id },
      data: { status: "error", message, finishedAt: new Date() },
    });
    return { status: "error", recordCount: 0, message };
  }
}

export async function getScrapeHistory(limit = 20) {
  return prisma.scrapeLog.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}
