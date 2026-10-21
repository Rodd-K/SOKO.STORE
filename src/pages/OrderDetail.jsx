import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { STATUS_STEPS, PAYMENT_LABELS, formatDate, formatKsh } from "../lib/format";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", Number(id))
      .maybeSingle()
      .then(({ data }) => {
        setOrder(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p className="px-4 py-20 text-center text-sm text-ink/60">Loading…</p>;
  }

  // RLS hides other people's orders, so they simply come back empty.
  if (!order) {
    return (
      <div className="mx-auto max-w-content px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Order not found</h1>
        <Link to="/account/orders" className="mt-4 inline-block text-sm font-semibold text-marigold-600">
          Back to my orders
        </Link>
      </div>
    );
  }

  const cancelled = order.status === "Cancelled";
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-content px-4 py-8">
      <p className="text-sm text-ink/50">
        <Link to="/account/orders" className="hover:text-navy-900">
          My Orders
        </Link>{" "}
        / Order #{order.id}
      </p>
      <h1 className="mt-1 font-display text-2xl font-bold text-navy-900">Order #{order.id}</h1>
      <p className="text-sm text-ink/60">Placed on {formatDate(order.created_at)}</p>

      {/* Status tracker */}
      {cancelled ? (
        <p className="mt-8 rounded-md bg-sale/10 px-4 py-3 text-sm font-medium text-sale">
          This order was cancelled.
        </p>
      ) : (
        <div className="mt-8 flex items-center">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    i <= currentStepIndex ? "bg-navy-800 text-white" : "bg-navy-100 text-ink/40"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`mt-1.5 hidden text-xs sm:block ${
                    i <= currentStepIndex ? "text-navy-900" : "text-ink/40"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 ${i < currentStepIndex ? "bg-navy-800" : "bg-navy-100"}`} />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-col gap-8 lg:flex-row">
        {/* Items */}
        <div className="flex-1 divide-y divide-navy-100 rounded-lg border border-navy-100">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 text-sm">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="font-semibold text-navy-900">
                {formatKsh(item.price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Delivery + total */}
        <div className="w-full shrink-0 rounded-lg border border-navy-100 bg-surface p-5 lg:w-80">
          <h2 className="mb-2 font-bold text-navy-900">Delivery address</h2>
          <p className="text-sm text-ink/70">
            {order.full_name}
            <br />
            {order.address}, {order.town}, {order.county}
            <br />
            {order.phone}
          </p>
          <p className="mt-3 text-sm text-ink/70">Payment: {PAYMENT_LABELS[order.payment_method]}</p>
          <div className="mt-5 space-y-2 border-t border-navy-100 pt-4 text-sm text-ink/70">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatKsh(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{formatKsh(order.delivery_fee)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-navy-100 pt-4 font-display font-bold text-navy-900">
            <span>Total</span>
            <span>{formatKsh(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
