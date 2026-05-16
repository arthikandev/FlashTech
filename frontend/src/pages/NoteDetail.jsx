import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getNote, deleteNote } from "../api/notes.api.js";
import { summarize } from "../api/ai.api.js";

export default function NoteDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [note, setNote] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  const load = () => getNote(id).then(setNote);
  useEffect(() => { load(); }, [id]);

  const handleSummarize = async () => {
    setSummarizing(true);
    try {
      const { summary } = await summarize(id);
      setNote((n) => ({ ...n, summary }));
      toast.success("Summary ready");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setSummarizing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this note?")) return;
    await deleteNote(id);
    toast.success("Deleted");
    nav("/dashboard");
  };

  if (!note) return <p className="text-gray-500">Loading…</p>;

  return (
    <article className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{note.title}</h1>
        <div className="space-x-2 text-sm">
          <Link to={`/notes/${id}/edit`} className="text-blue-600">Edit</Link>
          <button onClick={handleDelete} className="text-red-600">Delete</button>
        </div>
      </header>
      <p className="whitespace-pre-wrap text-gray-800">{note.content}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={handleSummarize} disabled={summarizing} className="px-3 py-1.5 bg-purple-600 text-white rounded text-sm">
          {summarizing ? "Summarizing…" : "AI Summary"}
        </button>
        <Link to={`/notes/${id}/flashcards`} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-sm">
          Flashcards
        </Link>
        <Link to={`/notes/${id}/quiz`} className="px-3 py-1.5 bg-amber-600 text-white rounded text-sm">
          Quiz
        </Link>
      </div>

      {note.summary && (
        <section className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded">
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="text-gray-800 whitespace-pre-wrap">{note.summary}</p>
        </section>
      )}
    </article>
  );
}
