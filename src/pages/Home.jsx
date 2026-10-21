import { Link } from "react-router-dom";
import { useCatalog } from "../context/CatalogContext";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const { products, categories, loading } = useCatalog();
  const featured = products.filter((p) => p.originalPrice).slice(0, 4);
  const latest = products.slice(0, 8); // catalog is already newest-first

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy-900 text-white">
        <div className="mx-auto grid max-w-content gap-8 px-4 py-14 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
              Nairobi's marketplace,
              <br />
              <span className="text-marigold-500">delivered to your door.</span>
            </h1>
            <p className="mt-4 max-w-md text-navy-100/80">
              Phones, electronics, fashion and home goods from verified sellers —
              with cash on delivery available countywide.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-block rounded-md bg-marigold-500 px-6 py-3 font-semibold text-navy-900 transition hover:bg-marigold-400"
            >
              Start shopping
            </Link>
          </div>
          <img
            src="https://picsum.photos/seed/soko-hero/600/440"
            alt="Featured products"
            className="hidden rounded-lg md:block"
          />
        </div>
      </section>

      <div className="mx-auto max-w-content px-4">
        {/* Category grid */}
        <section className="py-10">
          <h2 className="mb-4 text-lg font-bold text-navy-900">Shop by category</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="rounded-lg border border-navy-100 bg-surface px-4 py-6 text-center text-sm font-medium text-navy-800 transition hover:border-marigold-500 hover:text-marigold-600"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Promo banner */}
        <section className="mb-10 flex flex-col items-start justify-between gap-4 rounded-lg bg-marigold-500 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-xl font-bold text-navy-900">
              10% off orders over KSh 10,000
            </p>
            <p className="text-sm text-navy-900/70">Applied automatically at checkout.</p>
          </div>
          <Link
            to="/products"
            className="rounded-md bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-800"
          >
            Shop deals
          </Link>
        </section>

        {/* Featured products */}
        <section className="pb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">On offer right now</h2>
            <Link to="/products" className="text-sm font-medium text-navy-800 hover:text-marigold-600">
              View all
            </Link>
          </div>
          {loading && <p className="text-sm text-ink/60">Loading products…</p>}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Latest products */}
        <section className="pb-14">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900">Latest arrivals</h2>
            <Link to="/products" className="text-sm font-medium text-navy-800 hover:text-marigold-600">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {latest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
