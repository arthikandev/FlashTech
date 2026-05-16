import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NoteEditor from "./pages/NoteEditor.jsx";
import NoteDetail from "./pages/NoteDetail.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import Quiz from "./pages/Quiz.jsx";
import Progress from "./pages/Progress.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-5xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notes/new" element={<NoteEditor />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
            <Route path="/notes/:id/edit" element={<NoteEditor />} />
            <Route path="/notes/:id/flashcards" element={<Flashcards />} />
            <Route path="/notes/:id/quiz" element={<Quiz />} />
            <Route path="/progress" element={<Progress />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}
