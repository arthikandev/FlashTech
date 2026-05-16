const { openai, MODEL } = require("../config/openai");

const SUMMARIZE_SYSTEM =
  "You are a helpful study assistant. Summarize the following study notes into clear, concise paragraphs a student can quickly review.";

const FLASHCARDS_SYSTEM =
  'You are a study assistant. Generate 8 flashcard question-answer pairs from the notes. Respond ONLY with JSON: [{"question":"...","answer":"..."}]';

const QUIZ_SYSTEM =
  'Generate 5 multiple-choice questions. Respond ONLY with JSON: [{"question":"...","options":["A","B","C","D"],"answer":"A"}]';

async function chat(systemPrompt, userContent, maxTokens) {
  const completion = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  });
  return completion.choices[0]?.message?.content?.trim() || "";
}

function parseJsonSafe(raw) {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const err = new Error("AI returned invalid JSON");
    err.status = 502;
    throw err;
  }
}

const summarizeNote = (content) => chat(SUMMARIZE_SYSTEM, content, 500);

const generateFlashcards = async (content) => {
  const raw = await chat(FLASHCARDS_SYSTEM, content, 800);
  const parsed = parseJsonSafe(raw);
  if (!Array.isArray(parsed)) throw Object.assign(new Error("Expected array"), { status: 502 });
  return parsed.filter((c) => c?.question && c?.answer);
};

const generateQuiz = async (content) => {
  const raw = await chat(QUIZ_SYSTEM, content, 1000);
  const parsed = parseJsonSafe(raw);
  if (!Array.isArray(parsed)) throw Object.assign(new Error("Expected array"), { status: 502 });
  return parsed.filter(
    (q) => q?.question && Array.isArray(q?.options) && q.options.length === 4 && q.answer
  );
};

module.exports = { summarizeNote, generateFlashcards, generateQuiz };
