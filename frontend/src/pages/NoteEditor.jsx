import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { createNote, getNote, updateNote } from "../api/notes.api.js";

export default function NoteEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getNote(id).then((n) => setForm({ title: n.title, content: n.content }));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const note = id ? await updateNote(id, form) : await createNote(form);
      toast.success("Saved");
      nav(`/notes/${note.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-3xl mx-auto space-y-4">
      <input
        placeholder="Title"
        required
        className="w-full border rounded px-3 py-2 text-lg"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        placeholder="Write your note here…"
        required
        rows={14}
        className="w-full border rounded px-3 py-2"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />
      <button
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
