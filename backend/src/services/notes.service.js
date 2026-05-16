const prisma = require("../config/database");

const listForUser = (userId) =>
  prisma.note.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, content: true, summary: true, createdAt: true, updatedAt: true },
  });

const getById = (id, userId) =>
  prisma.note.findFirst({
    where: { id, userId },
    include: { flashcards: true },
  });

const create = (userId, data) => prisma.note.create({ data: { ...data, userId } });

const update = async (id, userId, data) => {
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return null;
  return prisma.note.update({ where: { id }, data });
};

const remove = async (id, userId) => {
  const existing = await prisma.note.findFirst({ where: { id, userId } });
  if (!existing) return null;
  await prisma.note.delete({ where: { id } });
  return existing;
};

const saveSummary = (id, summary) => prisma.note.update({ where: { id }, data: { summary } });

module.exports = { listForUser, getById, create, update, remove, saveSummary };
