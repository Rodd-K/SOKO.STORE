import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import { useAuth } from "../context/AuthContext";
import { isValidKenyanPhone } from "../lib/format";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { user, loading, signUp } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) {
      setError("Fill in every field.");
      return;
    }
    if (!isValidKenyanPhone(form.phone)) {
      setError("Enter a valid Kenyan phone number, e.g. 0712 345 678.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setError("");
    setSubmitting(true);
    const { data, error: authError } = await signUp({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      phone: form.phone,
    });
    setSubmitting(false);

    if (authError) {
      setError(authError.message);
      return;
    }
    if (data.session) {
      navigate("/"); // email confirmation is off, so the user is already signed in
    } else {
      setNotice("Account created. Check your email to confirm it, then log in.");
    }
  }

  if (notice) {
    return (
      <AuthCard title="Almost there" subtitle={notice}>
        <Link
          to="/login"
          className="block w-full rounded-md bg-navy-800 py-2.5 text-center text-sm font-semibold text-white hover:bg-navy-700"
        >
          Go to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Join Soko to track orders and checkout faster.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        {error && <p className="text-sm text-sale">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-navy-800 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-marigold-600">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy-900">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800"
      />
    </label>
  );
}
