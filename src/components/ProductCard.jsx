import { Link } from "react-router-dom";
import { StarIcon } from "./Icons";
import { useCart } from "../context/CartContext";
import { formatKsh } from "../lib/format";

export default function ProductCard({ product }) {
  const { items, addToCart } = useCart();
  const outOfStock = product.stock === 0;
  const inCart = items.find((i) => i.id === product.id)?.quantity ?? 0;
  const maxedOut = !outOfStock && inCart >= product.stock;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <div className="group flex flex-col rounded-lg border border-navy-100 bg-white p-3 transition hover:border-navy-800/30">
      <Link to={`/product/${product.id}`} className="relative mb-3 block overflow-hidden rounded-md bg-surface">
        <img
          src={product.image}
          alt={product.name}
          className="aspect-square w-full object-cover transition group-hover:scale-[1.03]"
          loading="lazy"
        />
        {product.isNew && (
          <span className="absolute left-2 top-2 rounded bg-navy-800 px-2 py-0.5 text-[11px] font-semibold text-white">
            New
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-sale">
            Out of stock
          </span>
        )}
      </Link>

      <Link to={`/product/${product.id}`}>
        <h3 className="line-clamp-2 text-sm font-medium text-ink hover:text-navy-900">{product.name}</h3>
      </Link>

      <div className="mt-1 flex items-center gap-1 text-marigold-500">
        <StarIcon filled className="h-3.5 w-3.5" />
        <span className="text-xs text-ink/60">{product.rating}</span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-display text-base font-bold text-navy-900">
          {formatKsh(product.price)}
        </span>
        {hasDiscount && (
          <span className="text-xs text-ink/40 line-through">
            {formatKsh(product.originalPrice)}
          </span>
        )}
      </div>

      <p className={`mt-1 text-xs ${outOfStock ? "text-sale" : "text-stock"}`}>
        {outOfStock ? "Unavailable" : `${product.stock} in stock`}
      </p>

      <button
        type="button"
        disabled={outOfStock || maxedOut}
        onClick={() => addToCart(product, 1)}
        className="mt-3 rounded-md bg-navy-800 py-2 text-sm font-semibold text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-navy-100 disabled:text-ink/40"
      >
        {outOfStock ? "Out of stock" : maxedOut ? "Max in cart" : "Add to cart"}
      </button>
    </div>
  );
}
