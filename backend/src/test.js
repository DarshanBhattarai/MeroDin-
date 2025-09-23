import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const entry = await prisma.diaryEntry.create({
    data: {
      userId: "user123",
      title: "My First Diary Entry",
      content: "Started using Prisma and Docker today!",
      mood: "Excited"
    }
  });
  console.log(entry);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
