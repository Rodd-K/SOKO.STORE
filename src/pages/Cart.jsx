import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { TrashIcon } from "../components/Icons";
import { formatKsh } from "../lib/format";


export default function Cart() {
  const { items, updateQuantity, removeFromCart, subtotal, delivery, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Add something you like — it'll show up here.</p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-md bg-navy-800 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy-900">Your cart</h1>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row">
        {/* Line items */}
        <div className="flex-1 divide-y divide-navy-100 rounded-lg border border-navy-100">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4">
              <img
                src={item.image}
                alt={item.name}
                className="h-20 w-20 shrink-0 rounded-md bg-surface object-cover"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    aria-label={`Remove ${item.name} from cart`}
                    className="text-ink/40 hover:text-sale"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center rounded-md border border-navy-100">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="px-3 py-1 text-sm text-navy-800 disabled:text-ink/20"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="px-3 py-1 text-sm text-navy-800 disabled:text-ink/20"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-display font-bold text-navy-900">
                    {formatKsh(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="w-full shrink-0 rounded-lg border border-navy-100 bg-surface p-5 lg:w-80">
          <h2 className="mb-4 font-bold text-navy-900">Order summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/70">Subtotal</dt>
              <dd>{formatKsh(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Delivery</dt>
              <dd>{formatKsh(delivery)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-navy-100 pt-4 font-display font-bold text-navy-900">
            <span>Total</span>
            <span>{formatKsh(total)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-5 block w-full rounded-md bg-marigold-500 py-3 text-center text-sm font-semibold text-navy-900 hover:bg-marigold-400"
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
