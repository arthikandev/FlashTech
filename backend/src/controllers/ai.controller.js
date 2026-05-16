const prisma = require("../config/database");
const notesService = require("../services/notes.service");
const aiService = require("../services/ai.service");
const { apiResponse } = require("../utils/apiResponse");

async function loadNote(req, res) {
  const note = await notesService.getById(req.body.noteId, req.user.id);
  if (!note) {
    res.status(404).json(apiResponse.error("Note not found"));
    return null;
  }
  return note;
}

exports.summarize = async (req, res) => {
  const note = await loadNote(req, res);
  if (!note) return;
  try {
    const summary = await aiService.summarizeNote(note.content);
    await notesService.saveSummary(note.id, summary);
    return res.json(apiResponse.success({ summary }));
  } catch (e) {
    return res.status(e.status || 503).json(apiResponse.error(e.message || "AI service unavailable"));
  }
};

exports.flashcards = async (req, res) => {
  const note = await loadNote(req, res);
  if (!note) return;
  try {
    const cards = await aiService.generateFlashcards(note.content);
    await prisma.flashcard.deleteMany({ where: { noteId: note.id } });
    await prisma.flashcard.createMany({
      data: cards.map((c) => ({ noteId: note.id, question: c.question, answer: c.answer })),
    });
    const saved = await prisma.flashcard.findMany({ where: { noteId: note.id } });
    return res.json(apiResponse.success(saved));
  } catch (e) {
    return res.status(e.status || 503).json(apiResponse.error(e.message || "AI service unavailable"));
  }
};

exports.quiz = async (req, res) => {
  const note = await loadNote(req, res);
  if (!note) return;
  try {
    const questions = await aiService.generateQuiz(note.content);
    return res.json(apiResponse.success({ noteId: note.id, questions }));
  } catch (e) {
    return res.status(e.status || 503).json(apiResponse.error(e.message || "AI service unavailable"));
  }
};
