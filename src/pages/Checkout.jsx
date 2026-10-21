import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { supabase } from "../lib/supabase";
import { formatKsh, isValidKenyanPhone, PAYMENT_LABELS } from "../lib/format";

const PAYMENT_METHODS = Object.entries(PAYMENT_LABELS).map(([value, label]) => ({ value, label }));

export default function Checkout() {
  const { items, subtotal, delivery, total, clearCart } = useCart();
  const { user } = useAuth();
  const { refresh } = useCatalog();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    county: "",
    town: "",
    address: "",
    payment: "cod",
  });
  const [orderNumber, setOrderNumber] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prefill delivery details from the saved profile (only fills empty fields).
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || data.full_name || "",
          phone: prev.phone || data.phone || "",
          county: prev.county || data.county || "",
          town: prev.town || data.town || "",
        }));
      });
  }, [user]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isValidKenyanPhone(form.phone)) {
      setError("Enter a valid Kenyan phone number, e.g. 0712 345 678.");
      return;
    }

    setSubmitting(true);
    // The database re-checks prices and stock, so the browser total is never trusted.
    const { data, error: rpcError } = await supabase.rpc("place_order", {
      p_items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      p_delivery: {
        full_name: form.fullName,
        phone: form.phone,
        county: form.county,
        town: form.town,
        address: form.address,
      },
      p_payment: form.payment,
    });
    setSubmitting(false);

    if (rpcError) {
      setError(rpcError.message);
      refresh(); // stock may have changed, so reload the catalog
      return;
    }

    setOrderNumber(data);
    clearCart();
    refresh();
  }

  if (orderNumber) {
    return (
      <div className="mx-auto max-w-content px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Order placed</h1>
        <p className="mt-2 text-ink/60">
          Order <span className="font-semibold text-navy-900">#{orderNumber}</span> is confirmed.
          Payment: {PAYMENT_LABELS[form.payment]}.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/account/orders"
            className="rounded-md bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
          >
            View my orders
          </Link>
          <Link
            to="/products"
            className="rounded-md border border-navy-100 px-5 py-2.5 text-sm font-semibold text-navy-900 hover:border-navy-800"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-content px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Nothing to check out</h1>
        <p className="mt-2 text-ink/60">Add a product to your cart first.</p>
        <Link to="/products" className="mt-6 inline-block text-sm font-semibold text-marigold-600">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-navy-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-8 lg:flex-row">
        <div className="flex-1 space-y-8">
          {/* Delivery information */}
          <section className="rounded-lg border border-navy-100 p-5">
            <h2 className="mb-4 font-bold text-navy-900">Delivery information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} required />
              <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
              <Field label="County" name="county" value={form.county} onChange={handleChange} required />
              <Field label="Town" name="town" value={form.town} onChange={handleChange} required />
              <div className="sm:col-span-2">
                <Field
                  label="Delivery address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Payment method */}
          <section className="rounded-lg border border-navy-100 p-5">
            <h2 className="mb-4 font-bold text-navy-900">Payment method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex items-center gap-3 rounded-md border border-navy-100 px-4 py-3 text-sm has-[:checked]:border-navy-800"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={form.payment === method.value}
                    onChange={handleChange}
                  />
                  {method.label}
                </label>
              ))}
            </div>
            {form.payment !== "cod" && (
              <p className="mt-3 text-xs text-ink/60">
                Online payments aren't live yet. Your order will be saved and we'll contact you to
                complete payment.
              </p>
            )}
          </section>
        </div>

        {/* Order summary */}
        <div className="w-full shrink-0 rounded-lg border border-navy-100 bg-surface p-5 lg:w-80">
          <h2 className="mb-4 font-bold text-navy-900">Order summary</h2>
          <ul className="space-y-2 text-sm text-ink/70">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatKsh(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-navy-100 pt-4 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatKsh(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Delivery</span>
              <span>{formatKsh(delivery)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-navy-100 pt-4 font-display font-bold text-navy-900">
            <span>Total</span>
            <span>{formatKsh(total)}</span>
          </div>

          {error && <p className="mt-4 text-sm text-sale">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full rounded-md bg-marigold-500 py-3 text-sm font-semibold text-navy-900 hover:bg-marigold-400 disabled:opacity-60"
          >
            {submitting ? "Placing order…" : "Place order"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, required, type = "text" }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-navy-900">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-md border border-navy-100 px-3 py-2 outline-none focus:border-navy-800"
      />
    </label>
  );
}
