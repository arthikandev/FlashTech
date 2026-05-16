import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getQuiz, saveAttempt } from "../api/ai.api.js";
import ScoreDisplay from "../components/ScoreDisplay.jsx";

export default function Quiz() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuiz(id)
      .then((data) => setQuestions(data.questions || []))
      .catch((e) => toast.error(e.response?.data?.error || "Failed"))
      .finally(() => setLoading(false));
  }, [id]);

  const submit = async () => {
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
      0
    );
    setScore(correct);
    setSubmitted(true);
    try {
      await saveAttempt({ noteId: id, score: correct, total: questions.length });
    } catch (_e) {}
  };

  if (loading) return <p className="text-gray-500">Generating quiz…</p>;
  if (questions.length === 0) return <p className="text-gray-500">No quiz.</p>;
  if (submitted) return <ScoreDisplay score={score} total={questions.length} />;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {questions.map((q, i) => (
        <div key={i} className="bg-white p-4 rounded-lg shadow">
          <p className="font-medium mb-3">{i + 1}. {q.question}</p>
          {q.options.map((opt) => (
            <label key={opt} className="block py-1 cursor-pointer">
              <input
                type="radio"
                name={`q-${i}`}
                value={opt}
                checked={answers[i] === opt}
                onChange={() => setAnswers({ ...answers, [i]: opt })}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button
        onClick={submit}
        disabled={Object.keys(answers).length !== questions.length}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Submit quiz
      </button>
    </div>
  );
}
