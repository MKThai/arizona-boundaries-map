import prisma from "../db/index.js";

export async function getAllOfficials() {
  return prisma.official.findMany({
    orderBy: [{ branch: "asc" }, { name: "asc" }],
  });
}

export async function getOfficialsByBranch(branch: string) {
  return prisma.official.findMany({
    where: { branch },
    orderBy: { name: "asc" },
  });
}

export async function getOfficialsByChamber(chamber: string) {
  return prisma.official.findMany({
    where: { chamber },
    orderBy: [{ district: "asc" }, { name: "asc" }],
  });
}

export async function searchOfficials(query: string) {
  return prisma.official.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { title: { contains: query, mode: "insensitive" } },
        { party: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });
}
