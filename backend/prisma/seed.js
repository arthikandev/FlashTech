const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@studymate.ai" },
    update: {},
    create: {
      email: "test@studymate.ai",
      name: "Test Student",
      passwordHash,
    },
  });

  const note1 = await prisma.note.create({
    data: {
      userId: user.id,
      title: "Photosynthesis Basics",
      content:
        "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to produce glucose and oxygen. It occurs primarily in the chloroplasts, where chlorophyll absorbs light energy.",
    },
  });

  const note2 = await prisma.note.create({
    data: {
      userId: user.id,
      title: "Newton's Laws of Motion",
      content:
        "1. An object in motion stays in motion unless acted on by an external force. 2. Force equals mass times acceleration (F = ma). 3. For every action there is an equal and opposite reaction.",
    },
  });

  await prisma.flashcard.createMany({
    data: [
      { noteId: note1.id, question: "What gas do plants absorb during photosynthesis?", answer: "Carbon dioxide" },
      { noteId: note1.id, question: "What gas do plants release?", answer: "Oxygen" },
      { noteId: note1.id, question: "Where in the cell does photosynthesis occur?", answer: "Chloroplasts" },
      { noteId: note1.id, question: "What pigment absorbs light energy?", answer: "Chlorophyll" },
      { noteId: note1.id, question: "What sugar do plants produce?", answer: "Glucose" },
    ],
  });

  await prisma.quizAttempt.createMany({
    data: [
      { userId: user.id, noteId: note2.id, score: 2, total: 5 },
      { userId: user.id, noteId: note2.id, score: 3, total: 5 },
      { userId: user.id, noteId: note2.id, score: 4, total: 5 },
    ],
  });

  console.log("Seed complete. Login: test@studymate.ai / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
