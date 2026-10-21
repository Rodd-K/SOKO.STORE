import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../lib/format";
import { PageHeader } from "../../components/admin/AdminUi";

export default function AdminCustomers() {
  const { user } = useAuth();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    const { data, error: loadError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setPeople(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleAdmin(p) {
    const verb = p.is_admin ? "Remove admin access from" : "Make admin:";
    if (!window.confirm(`${verb} ${p.full_name || "this user"}?`)) return;
    const { error: e } = await supabase.from("profiles").update({ is_admin: !p.is_admin }).eq("id", p.id);
    if (e) return setError(e.message);
    setError("");
    load();
  }

  return (
    <>
      <PageHeader title="Customers" />
      {error && <p className="mb-4 text-sm text-sale">{error}</p>}
      {loading && <p className="text-sm text-ink/60">Loading…</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Location</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Role</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {people.map((p) => (
                <tr key={p.id}>
                  <td className="p-3 font-medium text-navy-900">{p.full_name || "—"}</td>
                  <td className="p-3">{p.phone || "—"}</td>
                  <td className="p-3">{[p.town, p.county].filter(Boolean).join(", ") || "—"}</td>
                  <td className="p-3">{formatDate(p.created_at)}</td>
                  <td className="p-3">{p.is_admin ? "Admin" : "Customer"}</td>
                  <td className="p-3 text-right">
                    {p.id !== user.id && (
                      <button onClick={() => toggleAdmin(p)} className="font-semibold text-navy-800 hover:underline">
                        {p.is_admin ? "Remove admin" : "Make admin"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
