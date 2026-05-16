import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold mb-4">StudyMate AI</h1>
      <p className="text-gray-600 mb-8">
        Turn your notes into flashcards and quizzes with AI.
      </p>
      <div className="space-x-4">
        <Link to="/register" className="px-6 py-2 bg-blue-600 text-white rounded">
          Get started
        </Link>
        <Link to="/login" className="px-6 py-2 border rounded">
          Login
        </Link>
      </div>
    </div>
  );
}
