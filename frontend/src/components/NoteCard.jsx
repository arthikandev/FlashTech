import { Link } from "react-router-dom";

export default function NoteCard({ note }) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block bg-white border rounded-lg p-4 hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg">{note.title}</h3>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(note.updatedAt).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-700 mt-2 line-clamp-3">{note.content}</p>
    </Link>
  );
}
