const prisma = require("../config/database");
const { apiResponse } = require("../utils/apiResponse");

exports.save = async (req, res) => {
  const { noteId, score, total } = req.body;
  if (!noteId || typeof score !== "number" || typeof total !== "number") {
    return res.status(400).json(apiResponse.error("noteId, score, total required"));
  }
  const note = await prisma.note.findFirst({ where: { id: noteId, userId: req.user.id } });
  if (!note) return res.status(404).json(apiResponse.error("Note not found"));

  const attempt = await prisma.quizAttempt.create({
    data: { noteId, score, total, userId: req.user.id },
  });
  return res.status(201).json(apiResponse.success(attempt, "Saved"));
};

exports.list = async (req, res) => {
  const attempts = await prisma.quizAttempt.findMany({
    where: { userId: req.user.id },
    orderBy: { takenAt: "asc" },
    include: { note: { select: { id: true, title: true } } },
  });
  const avgScore =
    attempts.length === 0
      ? 0
      : Math.round(
          (attempts.reduce((s, a) => s + a.score / a.total, 0) / attempts.length) * 100
        );
  return res.json(apiResponse.success({ attempts, avgScore }));
};
