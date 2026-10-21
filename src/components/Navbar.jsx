import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { CartIcon, SearchIcon, UserIcon } from "./Icons";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";

export default function Navbar() {
  const { itemCount } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const { categories } = useCatalog();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  async function handleLogout() {
    await signOut();
    navigate("/");
  }

  function handleSearch(e) {
    e.preventDefault();
    navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : "/products");
  }

  return (
    <header className="sticky top-0 z-30 bg-navy-800 text-white">
      <div className="mx-auto max-w-content px-4">
        {/* Top row: logo, search, icons */}
        <div className="flex items-center gap-4 py-3">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight shrink-0">
            soko<span className="text-marigold-500">.</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 md:block">
            <div className="flex items-center rounded-md bg-white px-3 py-2">
              <SearchIcon className="h-4 w-4 text-navy-800/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products, brands and categories"
                className="ml-2 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
              />
            </div>
          </form>

          <nav className="ml-auto flex items-center gap-5">
            {/* Visible on mobile too: icon only on small screens */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-sm hover:text-marigold-400"
                aria-label="Account"
              >
                <UserIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Account</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 rounded-md bg-marigold-500 px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-marigold-400"
                aria-label="Log in"
              >
                <UserIcon className="h-4 w-4" />
                <span>Log in</span>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-semibold text-marigold-400 hover:text-marigold-500">
                Admin
              </Link>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm hover:text-marigold-400"
              >
                Log out
              </button>
            )}
            <Link to="/cart" className="relative flex items-center gap-1.5 text-sm hover:text-marigold-400">
              <CartIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-marigold-500 text-[10px] font-semibold text-navy-900">
                  {itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="pb-3 md:hidden">
          <div className="flex items-center rounded-md bg-white px-3 py-2">
            <SearchIcon className="h-4 w-4 text-navy-800/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
              className="ml-2 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
            />
          </div>
        </form>

        {/* Category chip row */}
        <div className="chip-row flex gap-2 overflow-x-auto pb-3 text-sm">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="shrink-0 rounded-full border border-white/20 px-3 py-1 text-white/80 hover:border-marigold-500 hover:text-marigold-400"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
