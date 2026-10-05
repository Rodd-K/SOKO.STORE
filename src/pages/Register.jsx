import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (Object.values(form).some((v) => !v)) {
      setError("Fill in every field.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    // No backend yet — this is where POST /api/auth/register/ will go.
    setError("");
    navigate("/profile");
  }

  return (
    <AuthCard title="Create your account" subtitle="Join Soko to track orders and checkout faster.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field label="Phone number" name="phone" value={form.phone} onChange={handleChange} />
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
          className="w-full rounded-md bg-navy-800 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
        >
          Create account
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
