import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      setError("Enter your email.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: resetError } = await resetPassword(email);
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthCard title="Check your email" subtitle="If that email has an account, we've sent a link to reset your password.">
        <Link
          to="/login"
          className="block w-full rounded-md bg-navy-800 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-700"
        >
          Back to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset your password" subtitle="We'll email you a link to choose a new one.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-900">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800"
          />
        </label>
        {error && <p className="text-sm text-sale">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-navy-800 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        <Link to="/login" className="font-semibold text-marigold-600">
          Back to log in
        </Link>
      </p>
    </AuthCard>
  );
}
