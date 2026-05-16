import api from "./axiosInstance.js";

export const summarize = (noteId) =>
  api.post("/api/ai/summarize", { noteId }).then((r) => r.data.data);

export const getFlashcards = (noteId) =>
  api.post("/api/ai/flashcards", { noteId }).then((r) => r.data.data);

export const getQuiz = (noteId) =>
  api.post("/api/ai/quiz", { noteId }).then((r) => r.data.data);

export const saveAttempt = (data) =>
  api.post("/api/progress/save", data).then((r) => r.data.data);

export const getProgress = () =>
  api.get("/api/progress").then((r) => r.data.data);
