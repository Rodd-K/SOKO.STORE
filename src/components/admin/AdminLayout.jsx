import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/customers", label: "Customers" },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-navy-800 text-white">
        <div className="mx-auto flex max-w-content items-center gap-4 px-4 py-3">
          <Link to="/admin" className="font-display text-xl font-bold tracking-tight">
            soko<span className="text-marigold-500">.</span>{" "}
            <span className="text-sm font-medium text-white/60">Admin</span>
          </Link>
          <nav className="ml-auto flex items-center gap-5 text-sm">
            <Link to="/" className="hover:text-marigold-400">
              View store
            </Link>
            <button onClick={handleLogout} className="hover:text-marigold-400">
              Log out
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-content flex-col gap-6 px-4 py-6 md:flex-row">
        <aside className="w-full shrink-0 md:w-48">
          <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `shrink-0 rounded-md px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-navy-800 text-white" : "text-ink/70 hover:bg-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
