import prisma from "./index.js";

async function seed() {
  console.log("Seed skipped — officials are populated by the scraper.");
  console.log("Run: curl -X POST http://localhost:3000/api/scraper/trigger");
  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
