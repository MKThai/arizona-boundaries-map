import prisma from "./index.js";

const executives = [
  { name: "Katie Hobbs", title: "Governor", party: "Democratic", branch: "executive", imageUrl: "data/images/katie-hobbs.jpg" },
  { name: "Adrian Fontes", title: "Secretary of State", party: "Democratic", branch: "executive", imageUrl: "data/images/adrian-fontes.jpg" },
  { name: "Kris Mayes", title: "Attorney General", party: "Democratic", branch: "executive", imageUrl: "data/images/kris-mayes.jpg" },
  { name: "Kimberly Yee", title: "Treasurer", party: "Republican", branch: "executive", imageUrl: "data/images/kimberly-yee.jpg" },
  { name: "Tom Horne", title: "Supt. of Public Instruction", party: "Republican", branch: "executive", imageUrl: "data/images/tom-horne.jpg" },
  { name: "Les Presmyk", title: "Mine Inspector", party: "Republican", branch: "executive", imageUrl: "data/images/les-presmyk.jpg" },
];

async function seed() {
  console.log("Seeding database...");

  for (const official of executives) {
    await prisma.official.upsert({
      where: { id: executives.indexOf(official) + 1 },
      update: official,
      create: { ...official, state: "AZ", source: "manual" },
    });
  }

  console.log(`Seeded ${executives.length} executive officials`);
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
