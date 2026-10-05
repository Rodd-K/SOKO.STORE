import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import products from "../data/products";
import categories from "../data/categories";
import ProductCard from "../components/ProductCard";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const activeCategory = searchParams.get("category") || "";
  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "newest";
  const maxPrice = searchParams.get("maxPrice") || "";

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  const filtered = useMemo(() => {
    let result = [...products];

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (maxPrice) {
      result = result.filter((p) => p.price <= Number(maxPrice));
    }

    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else {
      result.sort((a, b) => b.id - a.id); // "newest" — highest id first
    }

    return result;
  }, [activeCategory, query, sort, maxPrice]);

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy-900">
        {query ? `Results for "${query}"` : activeCategoryName || "All products"}
      </h1>
      <p className="mt-1 text-sm text-ink/60">{filtered.length} products</p>

      <div className="mt-6 flex flex-col gap-8 md:flex-row">
        {/* Filters sidebar */}
        <aside className="w-full shrink-0 md:w-56">
          <div className="mb-6">
            <p className="mb-2 text-sm font-bold text-navy-900">Category</p>
            <ul className="space-y-1.5 text-sm">
              <li>
                <button
                  onClick={() => updateParam("category", "")}
                  className={`text-left ${!activeCategory ? "font-semibold text-marigold-600" : "text-ink/70 hover:text-navy-900"}`}
                >
                  All categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => updateParam("category", cat.slug)}
                    className={`text-left ${activeCategory === cat.slug ? "font-semibold text-marigold-600" : "text-ink/70 hover:text-navy-900"}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <label htmlFor="maxPrice" className="mb-2 block text-sm font-bold text-navy-900">
              Max price (KSh)
            </label>
            <input
              id="maxPrice"
              type="number"
              min="0"
              placeholder="e.g. 20000"
              value={maxPrice}
              onChange={(e) => updateParam("maxPrice", e.target.value)}
              className="w-full rounded-md border border-navy-100 px-3 py-2 text-sm outline-none focus:border-navy-800"
            />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 flex justify-end">
            <select
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="rounded-md border border-navy-100 px-3 py-2 text-sm outline-none focus:border-navy-800"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-navy-100 py-16 text-center">
              <p className="font-semibold text-navy-900">No products match those filters.</p>
              <p className="mt-1 text-sm text-ink/60">Try clearing a filter or searching a different term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
