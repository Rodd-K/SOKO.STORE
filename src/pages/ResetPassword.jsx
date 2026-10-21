import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { user, loading, updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setError("");
    setSubmitting(true);
    const { error: updateError } = await updatePassword(password);
    setSubmitting(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    navigate("/profile", { replace: true });
  }

  if (loading) {
    return <p className="px-4 py-20 text-center text-sm text-ink/60">Loading…</p>;
  }

  // Supabase signs the user in from the emailed link; without it there's nothing to reset.
  if (!user) {
    return (
      <AuthCard title="Link expired" subtitle="This reset link is invalid or has expired. Request a new one from the log in page." />
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-900">New password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-navy-900">Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800"
          />
        </label>
        {error && <p className="text-sm text-sale">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-navy-800 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
}
