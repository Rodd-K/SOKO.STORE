import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useCatalog } from "../../context/CatalogContext";
import { formatKsh } from "../../lib/format";
import { Field, Modal, PageHeader, PrimaryButton, inputClass } from "../../components/admin/AdminUi";

const EMPTY = {
  name: "",
  category: "",
  price: "",
  original_price: "",
  stock: "0",
  description: "",
  image: "",
  is_new: false,
  is_active: true,
};

export default function AdminProducts() {
  const { categories, refresh } = useCatalog();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = edit

  async function load() {
    const { data, error: loadError } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (loadError) setError(loadError.message);
    else setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, search]);

  async function toggleActive(p) {
    const { error: e } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (e) return setError(e.message);
    await load();
    refresh();
  }

  async function remove(p) {
    if (!window.confirm(`Delete "${p.name}" permanently?`)) return;
    const { error: e } = await supabase.from("products").delete().eq("id", p.id);
    if (e) {
      setError(
        e.code === "23503"
          ? `"${p.name}" is part of existing orders so it can't be deleted. Use Hide instead.`
          : e.message
      );
      return;
    }
    setError("");
    await load();
    refresh();
  }

  async function handleSaved() {
    setEditing(null);
    await load();
    refresh();
  }

  const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug;

  return (
    <>
      <PageHeader title="Products">
        <PrimaryButton onClick={() => setEditing({})}>+ Add product</PrimaryButton>
      </PageHeader>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products…"
        className={`${inputClass} mb-4 max-w-xs`}
      />
      {error && <p className="mb-4 text-sm text-sale">{error}</p>}
      {loading && <p className="text-sm text-ink/60">Loading…</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {visible.map((p) => (
                <tr key={p.id} className={p.is_active ? "" : "bg-surface text-ink/50"}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-navy-50" />
                      )}
                      <span className="font-medium text-navy-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{categoryName(p.category)}</td>
                  <td className="p-3">{formatKsh(p.price)}</td>
                  <td className={`p-3 ${p.stock === 0 ? "font-semibold text-sale" : ""}`}>{p.stock}</td>
                  <td className="p-3">{p.is_active ? "Live" : "Hidden"}</td>
                  <td className="space-x-3 whitespace-nowrap p-3 text-right">
                    <button onClick={() => setEditing(p)} className="font-semibold text-navy-800 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => toggleActive(p)} className="font-semibold text-marigold-600 hover:underline">
                      {p.is_active ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => remove(p)} className="font-semibold text-sale hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink/60">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

function ProductForm({ product, categories, onClose, onSaved }) {
  const isEdit = Boolean(product.id);
  const [form, setForm] = useState(() =>
    isEdit
      ? {
          name: product.name,
          category: product.category,
          price: String(product.price),
          original_price: product.original_price ? String(product.original_price) : "",
          stock: String(product.stock),
          description: product.description || "",
          image: product.image || "",
          is_new: product.is_new,
          is_active: product.is_active,
        }
      : { ...EMPTY, category: categories[0]?.slug || "" }
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    if (file.size > 3 * 1024 * 1024) return setError("Image must be under 3 MB.");
    setError("");
    setUploading(true);
    const ext = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || "jpg"}`;
    const { error: upError } = await supabase.storage.from("product-images").upload(path, file);
    if (upError) {
      setError(`Upload failed: ${upError.message}`);
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      set("image", data.publicUrl);
    }
    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const price = Number(form.price);
    const original = form.original_price === "" ? null : Number(form.original_price);
    const stock = Number(form.stock);

    if (!form.name.trim()) return setError("Enter a product name.");
    if (!form.category) return setError("Choose a category. Add one under Categories first if the list is empty.");
    if (!Number.isInteger(price) || price < 0) return setError("Price must be a whole number of KSh.");
    if (original !== null && (!Number.isInteger(original) || original < 0))
      return setError("Original price must be a whole number of KSh.");
    if (original !== null && original <= price)
      return setError("Original price should be higher than the selling price (or leave it empty).");
    if (!Number.isInteger(stock) || stock < 0) return setError("Stock must be a whole number, 0 or more.");

    setError("");
    setSaving(true);
    const row = {
      name: form.name.trim(),
      category: form.category,
      price,
      original_price: original,
      stock,
      description: form.description.trim() || null,
      image: form.image.trim() || null,
      is_new: form.is_new,
      is_active: form.is_active,
    };
    const query = isEdit
      ? supabase.from("products").update(row).eq("id", product.id)
      : supabase.from("products").insert(row);
    const { error: saveError } = await query;
    setSaving(false);
    if (saveError) return setError(saveError.message);
    onSaved();
  }

  return (
    <Modal title={isEdit ? "Edit product" : "Add product"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>

        <Field label="Category">
          <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Price (KSh)">
            <input className={inputClass} inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </Field>
          <Field label="Was (KSh)" hint="Optional, shows a sale">
            <input
              className={inputClass}
              inputMode="numeric"
              value={form.original_price}
              onChange={(e) => set("original_price", e.target.value)}
            />
          </Field>
          <Field label="Stock">
            <input className={inputClass} inputMode="numeric" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            rows={3}
            className={inputClass}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <Field label="Image" hint="Upload a file (max 3 MB) or paste an image link.">
          <div className="flex items-center gap-3">
            {form.image ? (
              <img src={form.image} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />
            ) : (
              <div className="h-16 w-16 shrink-0 rounded bg-navy-50" />
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <input type="file" accept="image/*" onChange={handleFile} className="block w-full text-sm" />
              <input
                className={inputClass}
                placeholder="https://…"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
              />
            </div>
          </div>
          {uploading && <span className="mt-1 block text-xs text-ink/60">Uploading…</span>}
        </Field>

        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_new} onChange={(e) => set("is_new", e.target.checked)} />
            Mark as new
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            Visible in shop
          </label>
        </div>

        {error && <p className="text-sm text-sale">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm font-medium text-ink/70 hover:bg-surface">
            Cancel
          </button>
          <PrimaryButton type="submit" disabled={saving || uploading}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
