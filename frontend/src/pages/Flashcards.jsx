import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getFlashcards } from "../api/ai.api.js";

export default function Flashcards() {
  const { id } = useParams();
  const [cards, setCards] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlashcards(id)
      .then((c) => setCards(c))
      .catch((e) => toast.error(e.response?.data?.error || "Failed"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-gray-500">Generating flashcards…</p>;
  if (cards.length === 0) return <p className="text-gray-500">No flashcards.</p>;

  const card = cards[idx];

  return (
    <div className="max-w-xl mx-auto text-center">
      <p className="text-sm text-gray-500 mb-2">{idx + 1} / {cards.length}</p>
      <div
        onClick={() => setFlipped((f) => !f)}
        className="bg-white border rounded-lg shadow p-10 min-h-[200px] cursor-pointer flex items-center justify-center text-lg"
      >
        {flipped ? card.answer : card.question}
      </div>
      <div className="mt-4 space-x-3">
        <button
          onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }}
          className="px-4 py-2 border rounded"
        >
          Prev
        </button>
        <button
          onClick={() => { setIdx((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
          className="px-4 py-2 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
