import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import products from "../data/products";
import categories from "../data/categories";
import ProductCard from "../components/ProductCard";
import { StarIcon } from "../components/Icons";
import { useCart } from "../context/CartContext";

function formatKsh(amount) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="mx-auto max-w-content px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Product not found</h1>
        <p className="mt-2 text-ink/60">It may have been removed or the link is wrong.</p>
        <Link to="/products" className="mt-6 inline-block text-sm font-semibold text-marigold-600">
          Back to all products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const categoryName = categories.find((c) => c.slug === product.category)?.name;
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  function handleAddToCart() {
    addToCart(product, qty);
    setAdded(true);
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      {/* Breadcrumb */}
      <p className="mb-6 text-sm text-ink/50">
        <Link to="/products" className="hover:text-navy-900">
          All products
        </Link>{" "}
        /{" "}
        <Link to={`/products?category=${product.category}`} className="hover:text-navy-900">
          {categoryName}
        </Link>
      </p>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg bg-surface">
          <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
          {product.isNew && (
            <span className="absolute left-3 top-3 rounded bg-navy-800 px-2 py-0.5 text-xs font-semibold text-white">
              New
            </span>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-1.5 text-marigold-500">
            <StarIcon filled className="h-4 w-4" />
            <span className="text-sm text-ink/60">{product.rating} rating</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-navy-900">
              {formatKsh(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-base text-ink/40 line-through">
                {formatKsh(product.originalPrice)}
              </span>
            )}
          </div>

          <p className={`mt-2 text-sm font-medium ${outOfStock ? "text-sale" : "text-stock"}`}>
            {outOfStock ? "Out of stock" : `${product.stock} available`}
          </p>

          <p className="mt-5 max-w-prose text-sm leading-relaxed text-ink/70">
            Placeholder description — swap for real product copy once the backend is
            connected. Describe material, size/fit, what's in the box, and anything a
            buyer needs before purchasing.
          </p>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-md border border-navy-100">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-navy-800"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-navy-800"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-md bg-navy-800 py-3 text-sm font-semibold text-white hover:bg-navy-700"
              >
                Add to cart
              </button>
            </div>
          )}

          {added && (
            <div className="mt-4 flex items-center justify-between rounded-md bg-surface px-4 py-3 text-sm">
              <span className="text-stock">Added to cart.</span>
              <button onClick={() => navigate("/cart")} className="font-semibold text-navy-900 hover:text-marigold-600">
                View cart →
              </button>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-lg font-bold text-navy-900">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
