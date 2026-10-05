import { Link } from "react-router-dom";
import orders, { getOrderTotal } from "../data/orders";

const STATUS_COLOR = {
  Pending: "bg-navy-100 text-navy-800",
  Confirmed: "bg-navy-100 text-navy-800",
  Processing: "bg-marigold-400/30 text-marigold-600",
  Shipped: "bg-marigold-400/30 text-marigold-600",
  Delivered: "bg-stock/15 text-stock",
};

function formatKsh(amount) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export default function OrdersList() {
  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <p className="text-sm text-ink/50">
        <Link to="/profile" className="hover:text-navy-900">
          My Account
        </Link>{" "}
        / My Orders
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">My Orders</h1>

      <div className="mt-6 divide-y divide-navy-100 rounded-lg border border-navy-100">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/account/orders/${order.id}`}
            className="flex items-center justify-between gap-4 p-4 hover:bg-surface"
          >
            <div>
              <p className="font-semibold text-navy-900">Order #{order.id}</p>
              <p className="text-sm text-ink/60">
                {order.items.length} product{order.items.length > 1 ? "s" : ""} · {order.date}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLOR[order.status]}`}>
                {order.status}
              </span>
              <span className="font-display font-bold text-navy-900">
                {formatKsh(getOrderTotal(order))}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
