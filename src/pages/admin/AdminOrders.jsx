import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { PAYMENT_LABELS, formatDate, formatKsh } from "../../lib/format";
import { Modal, PageHeader, inputClass } from "../../components/admin/AdminUi";
import { STATUS_COLOR } from "../OrdersList";

const STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState(null);

  async function load() {
    const { data, error: loadError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (loadError) setError(loadError.message);
    else setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(order, status) {
    const { error: e } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (e) return setError(e.message);
    setError("");
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
  }

  const shown = filter === "All" ? orders : orders.filter((o) => o.status === filter);
  const open = orders.find((o) => o.id === openId);

  return (
    <>
      <PageHeader title="Orders">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className={`${inputClass} w-auto`}>
          <option>All</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </PageHeader>

      {error && <p className="mb-4 text-sm text-sale">{error}</p>}
      {loading && <p className="text-sm text-ink/60">Loading…</p>}

      {!loading && (
        <div className="overflow-x-auto rounded-lg border border-navy-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-100 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {shown.map((o) => (
                <tr key={o.id}>
                  <td className="p-3 font-medium text-navy-900">#{o.id}</td>
                  <td className="p-3">{o.full_name}</td>
                  <td className="p-3">{formatDate(o.created_at)}</td>
                  <td className="p-3">{formatKsh(o.total)}</td>
                  <td className="p-3">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o, e.target.value)}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-medium ${STATUS_COLOR[o.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setOpenId(o.id)} className="font-semibold text-navy-800 hover:underline">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ink/60">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <Modal title={`Order #${open.id}`} onClose={() => setOpenId(null)}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Deliver to</p>
                <p className="mt-1 font-medium text-navy-900">{open.full_name}</p>
                <p>{open.phone}</p>
                <p>
                  {open.address}, {open.town}, {open.county}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Payment</p>
                <p className="mt-1">{PAYMENT_LABELS[open.payment_method] || open.payment_method}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-ink/50">Placed</p>
                <p className="mt-1">{formatDate(open.created_at)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-navy-100">
              <ul className="divide-y divide-navy-100">
                {open.order_items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3 p-3">
                    <span>
                      {it.name} <span className="text-ink/50">× {it.quantity}</span>
                    </span>
                    <span>{formatKsh(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1 border-t border-navy-100 p-3">
                <div className="flex justify-between text-ink/60">
                  <span>Subtotal</span>
                  <span>{formatKsh(open.subtotal)}</span>
                </div>
                <div className="flex justify-between text-ink/60">
                  <span>Delivery</span>
                  <span>{formatKsh(open.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-navy-900">
                  <span>Total</span>
                  <span>{formatKsh(open.total)}</span>
                </div>
              </div>
            </div>

            <label className="block">
              <span className="mb-1.5 block font-medium text-navy-900">Status</span>
              <select
                value={open.status}
                onChange={(e) => updateStatus(open, e.target.value)}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </Modal>
      )}
    </>
  );
}
