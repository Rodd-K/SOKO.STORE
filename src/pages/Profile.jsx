import { useState } from "react";
import { Link } from "react-router-dom";

// Mock signed-in user. Once auth exists, this will come from the
// logged-in user's data instead of local state.
const MOCK_USER = {
  fullName: "Amina Wanjiru",
  email: "amina.wanjiru@example.com",
  phone: "0712 345 678",
  county: "Nairobi",
  town: "Westlands",
};

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "profile", label: "My Profile" },
  { key: "saved", label: "Saved Products" },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState(MOCK_USER);
  const [saved, setSaved] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    // No backend yet — this just confirms the form works.
    setSaved(true);
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
            <button className="shrink-0 rounded-md px-3 py-2 text-left text-sm font-medium text-sale hover:bg-surface">
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
              <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
                <Field label="Phone number" name="phone" value={form.phone} onChange={handleChange} />
                <Field label="County" name="county" value={form.county} onChange={handleChange} />
                <Field label="Town" name="town" value={form.town} onChange={handleChange} />

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="mt-2 rounded-md bg-navy-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
                  >
                    Save changes
                  </button>
                  {saved && (
                    <span className="ml-3 text-sm font-medium text-stock">Saved.</span>
                  )}
                </div>
              </form>
            </>
          )}

          {activeTab === "dashboard" && (
            <EmptyState
              title="Welcome back"
              body="Your recent orders and account activity will show up here."
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

function EmptyState({ title, body }) {
  return (
    <div className="py-12 text-center">
      <p className="font-bold text-navy-900">{title}</p>
      <p className="mt-1 text-sm text-ink/60">{body}</p>
    </div>
  );
}
