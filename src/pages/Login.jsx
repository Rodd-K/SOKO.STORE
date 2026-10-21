import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If the user was sent here from a protected page, go back there after login.
  const redirectTo = location.state?.from?.pathname || "/profile";

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Enter both your email and password.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: authError } = await signIn(form.email, form.password);
    setSubmitting(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate(redirectTo, { replace: true });
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

        <div className="text-right text-sm">
          <Link to="/forgot-password" className="text-marigold-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-navy-800 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
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
