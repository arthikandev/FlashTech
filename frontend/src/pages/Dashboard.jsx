import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNotes } from "../api/notes.api.js";
import NoteCard from "../components/NoteCard.jsx";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotes().then(setNotes).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My notes</h1>
        <Link to="/notes/new" className="px-4 py-2 bg-blue-600 text-white rounded">
          + New note
        </Link>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-500">No notes yet. Create your first one!</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((n) => <NoteCard key={n.id} note={n} />)}
        </div>
      )}
    </div>
  );
}
