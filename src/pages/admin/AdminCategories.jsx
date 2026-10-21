import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCatalog } from "../../context/CatalogContext";
import { PageHeader, PrimaryButton, inputClass } from "../../components/admin/AdminUi";

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategories() {
  const { categories, refresh } = useCatalog();
  const [name, setName] = useState("");
  const [editingSlug, setEditingSlug] = useState(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    const slug = slugify(name);
    if (!name.trim() || !slug) return setError("Enter a category name.");
    if (categories.some((c) => c.slug === slug)) return setError("That category already exists.");
    setBusy(true);
    const { error: e2 } = await supabase.from("categories").insert({ slug, name: name.trim() });
    setBusy(false);
    if (e2) return setError(e2.message);
    setError("");
    setName("");
    refresh();
  }

  async function handleRename(slug) {
    if (!editName.trim()) return setError("Name can't be empty.");
    const { error: e2 } = await supabase.from("categories").update({ name: editName.trim() }).eq("slug", slug);
    if (e2) return setError(e2.message);
    setError("");
    setEditingSlug(null);
    refresh();
  }

  async function handleDelete(c) {
    if (!window.confirm(`Delete the "${c.name}" category?`)) return;
    const { error: e2 } = await supabase.from("categories").delete().eq("slug", c.slug);
    if (e2) {
      setError(
        e2.code === "23503"
          ? `"${c.name}" still has products. Move or delete them first.`
          : e2.message
      );
      return;
    }
    setError("");
    refresh();
  }

  return (
    <>
      <PageHeader title="Categories" />

      <form onSubmit={handleAdd} className="mb-4 flex max-w-md gap-2">
        <input
          className={inputClass}
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <PrimaryButton type="submit" disabled={busy} className="shrink-0">
          Add
        </PrimaryButton>
      </form>
      {error && <p className="mb-4 text-sm text-sale">{error}</p>}

      <ul className="max-w-md divide-y divide-navy-100 rounded-lg border border-navy-100 bg-white">
        {categories.map((c) => (
          <li key={c.slug} className="flex items-center justify-between gap-3 p-3 text-sm">
            {editingSlug === c.slug ? (
              <>
                <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} />
                <span className="space-x-3 whitespace-nowrap">
                  <button onClick={() => handleRename(c.slug)} className="font-semibold text-navy-800 hover:underline">
                    Save
                  </button>
                  <button onClick={() => setEditingSlug(null)} className="text-ink/60 hover:underline">
                    Cancel
                  </button>
                </span>
              </>
            ) : (
              <>
                <span className="font-medium text-navy-900">{c.name}</span>
                <span className="space-x-3 whitespace-nowrap">
                  <button
                    onClick={() => {
                      setEditingSlug(c.slug);
                      setEditName(c.name);
                    }}
                    className="font-semibold text-navy-800 hover:underline"
                  >
                    Rename
                  </button>
                  <button onClick={() => handleDelete(c)} className="font-semibold text-sale hover:underline">
                    Delete
                  </button>
                </span>
              </>
            )}
          </li>
        ))}
        {categories.length === 0 && <li className="p-6 text-center text-sm text-ink/60">No categories yet.</li>}
      </ul>
    </>
  );
}
