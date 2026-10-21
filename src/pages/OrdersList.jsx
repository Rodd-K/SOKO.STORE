import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { formatDate, formatKsh } from "../lib/format";

export const STATUS_COLOR = {
  Pending: "bg-navy-100 text-navy-800",
  Confirmed: "bg-navy-100 text-navy-800",
  Processing: "bg-marigold-400/30 text-marigold-600",
  Shipped: "bg-marigold-400/30 text-marigold-600",
  Delivered: "bg-stock/15 text-stock",
  Cancelled: "bg-sale/15 text-sale",
};

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Row-level security means this only ever returns the signed-in user's orders.
    supabase
      .from("orders")
      .select("id, created_at, status, total, order_items(count)")
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (loadError) setError(loadError.message);
        else setOrders(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <p className="text-sm text-ink/50">
        <Link to="/profile" className="hover:text-navy-900">
          My Account
        </Link>{" "}
        / My Orders
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">My Orders</h1>

      {loading && <p className="mt-6 text-sm text-ink/60">Loading your orders…</p>}
      {error && <p className="mt-6 text-sm text-sale">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="mt-6 rounded-lg border border-dashed border-navy-100 py-16 text-center">
          <p className="font-semibold text-navy-900">No orders yet</p>
          <Link to="/products" className="mt-2 inline-block text-sm font-semibold text-marigold-600">
            Start shopping
          </Link>
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 divide-y divide-navy-100 rounded-lg border border-navy-100">
          {orders.map((order) => {
            const count = order.order_items?.[0]?.count ?? 0;
            return (
              <Link
                key={order.id}
                to={`/account/orders/${order.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-surface"
              >
                <div>
                  <p className="font-semibold text-navy-900">Order #{order.id}</p>
                  <p className="text-sm text-ink/60">
                    {count} product{count !== 1 ? "s" : ""} · {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
                    {order.status}
                  </span>
                  <span className="font-display font-bold text-navy-900">{formatKsh(order.total)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
