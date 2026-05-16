import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to={user ? "/dashboard" : "/"} className="font-bold text-lg">
          StudyMate AI
        </Link>
        <div className="space-x-4 text-sm">
          {user ? (
            <>
              <Link to="/dashboard">Notes</Link>
              <Link to="/progress">Progress</Link>
              <button onClick={handleLogout} className="text-red-600">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
