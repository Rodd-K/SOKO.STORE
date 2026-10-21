import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { formatDate, formatKsh } from "../../lib/format";
import { PageHeader, StatCard } from "../../components/admin/AdminUi";
import { STATUS_COLOR } from "../OrdersList";

const LOW_STOCK = 5;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const [orders, products, customers, recentOrders, low] = await Promise.all([
        supabase.from("orders").select("total, status"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("id, created_at, status, total, full_name")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("products")
          .select("id, name, stock")
          .lte("stock", LOW_STOCK)
          .order("stock")
          .limit(8),
      ]);
      const failed = [orders, products, customers, recentOrders, low].find((r) => r.error);
      if (failed) {
        setError(failed.error.message);
        return;
      }
      const live = orders.data.filter((o) => o.status !== "Cancelled");
      setStats({
        revenue: live.reduce((sum, o) => sum + o.total, 0),
        orders: orders.data.length,
        pending: orders.data.filter((o) => o.status === "Pending").length,
        products: products.count,
        customers: customers.count,
      });
      setRecent(recentOrders.data);
      setLowStock(low.data);
    }
    load();
  }, []);

  return (
    <>
      <PageHeader title="Dashboard" />
      {error && <p className="mb-4 text-sm text-sale">{error}</p>}
      {!stats && !error && <p className="text-sm text-ink/60">Loading…</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Revenue" value={formatKsh(stats.revenue)} />
            <StatCard label="Orders" value={stats.orders} />
            <StatCard label="Pending" value={stats.pending} tone={stats.pending ? "text-marigold-600" : ""} />
            <StatCard label="Products" value={stats.products} />
            <StatCard label="Customers" value={stats.customers} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-navy-100 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-navy-900">Recent orders</h2>
                <Link to="/admin/orders" className="text-sm font-semibold text-marigold-600">
                  View all
                </Link>
              </div>
              {recent.length === 0 && <p className="text-sm text-ink/60">No orders yet.</p>}
              <ul className="divide-y divide-navy-100">
                {recent.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-navy-900">
                        #{o.id} · {o.full_name}
                      </p>
                      <p className="text-xs text-ink/50">{formatDate(o.created_at)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-medium">{formatKsh(o.total)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLOR[o.status]}`}>{o.status}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-navy-100 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-navy-900">Low stock (≤ {LOW_STOCK})</h2>
                <Link to="/admin/products" className="text-sm font-semibold text-marigold-600">
                  Manage
                </Link>
              </div>
              {lowStock.length === 0 && <p className="text-sm text-ink/60">Everything is well stocked.</p>}
              <ul className="divide-y divide-navy-100">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="truncate">{p.name}</span>
                    <span className={`shrink-0 font-semibold ${p.stock === 0 ? "text-sale" : "text-marigold-600"}`}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </>
  );
}
