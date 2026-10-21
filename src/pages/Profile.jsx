import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { isValidKenyanPhone } from "../lib/format";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "profile", label: "My Profile" },
  { key: "saved", label: "Saved Products" },
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({ fullName: "", phone: "", county: "", town: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        if (data) {
          setForm({
            fullName: data.full_name || "",
            phone: data.phone || "",
            county: data.county || "",
            town: data.town || "",
          });
        }
        setLoading(false);
      });
  }, [user.id]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.phone && !isValidKenyanPhone(form.phone)) {
      setError("Enter a valid Kenyan phone number, e.g. 0712 345 678.");
      return;
    }
    setError("");
    setSaving(true);
    const { error: saveError } = await supabase
      .from("profiles")
      .update({
        full_name: form.fullName,
        phone: form.phone,
        county: form.county,
        town: form.town,
      })
      .eq("id", user.id);
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
    } else {
      setSaved(true);
    }
  }

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy-900">My Account</h1>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {/* Sidebar nav */}
        <aside className="w-full shrink-0 md:w-52">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium ${
                  activeTab === item.key
                    ? "bg-navy-800 text-white"
                    : "text-ink/70 hover:bg-surface"
                }`}
              >
                {item.label}
              </button>
            ))}
            <Link
              to="/account/orders"
              className="shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium text-ink/70 hover:bg-surface"
            >
              My Orders
            </Link>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium text-sale hover:bg-surface"
            >
              Logout
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 rounded-lg border border-navy-100 p-6">
          {activeTab === "profile" && (
            <>
              <h2 className="mb-1 font-bold text-navy-900">Profile details</h2>
              <p className="mb-6 text-sm text-ink/60">
                This information is used for delivery and order updates.
              </p>
              {loading ? (
                <p className="text-sm text-ink/60">Loading…</p>
              ) : (
                <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} />
                  <Field label="Email" name="email" type="email" value={user.email} disabled />
                  <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                  <Field label="County" name="county" value={form.county} onChange={handleChange} />
                  <Field label="Town" name="town" value={form.town} onChange={handleChange} />

                  <div className="sm:col-span-2">
                    {error && <p className="mb-2 text-sm text-sale">{error}</p>}
                    <button
                      type="submit"
                      disabled={saving}
                      className="mt-2 rounded-md bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                    {saved && <span className="ml-3 text-sm font-medium text-stock">Saved.</span>}
                  </div>
                </form>
              )}
            </>
          )}

          {activeTab === "dashboard" && (
            <EmptyState
              title={form.fullName ? `Welcome back, ${form.fullName.split(" ")[0]}` : "Welcome back"}
              body="Track your purchases under My Orders."
            />
          )}
          {activeTab === "saved" && (
            <EmptyState
              title="No saved products"
              body="Tap the heart icon on a product to save it for later."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", disabled }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy-900">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800 disabled:bg-surface disabled:text-ink/50"
      />
    </label>
  );
}

function EmptyState({ title, body }) {
  return (
    <div className="py-12 text-center">
      <p className="font-bold text-navy-900">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{body}</p>
    </div>
  );
}
