import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      nav("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12 bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          required
          className="w-full border rounded px-3 py-2"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="w-full border rounded px-3 py-2"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        No account? <Link to="/register" className="text-blue-600">Register</Link>
      </p>
    </div>
  );
}
