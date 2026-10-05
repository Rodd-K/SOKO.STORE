import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Enter both your email and password.");
      return;
    }
    // No backend yet — this is where POST /api/auth/login/ will go.
    setError("");
    navigate("/profile");
  }

  return (
    <AuthCard title="Log in" subtitle="Welcome back to Soko.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-900">Email</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-900">Password</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800"
          />
        </label>

        {error && <p className="text-sm text-sale">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-md bg-navy-800 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        New to Soko?{" "}
        <Link to="/register" className="font-semibold text-marigold-600">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
