export default function Footer() {
  return (
    <footer className="mt-16 border-t border-navy-100 bg-surface">
      <div className="mx-auto max-w-content px-4 py-10 text-sm text-navy-800/70">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <p className="mb-3 font-display text-lg font-semibold text-navy-900">
              soko<span className="text-marigold-500">.</span>
            </p>
            <p className="text-navy-800/60">Everything you need, delivered across Kenya.</p>
          </div>
          <div>
            <p className="mb-3 font-semibold text-navy-900">Shop</p>
            <ul className="space-y-2">
              <li>All products</li>
              <li>Deals</li>
              <li>New arrivals</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-navy-900">Account</p>
            <ul className="space-y-2">
              <li>My orders</li>
              <li>My profile</li>
              <li>Saved products</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-navy-900">Support</p>
            <ul className="space-y-2">
              <li>Contact us</li>
              <li>Delivery info</li>
              <li>Returns</li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-navy-100 pt-6 text-xs text-navy-800/40">
          Built as a student teaching project — not a live store.
        </p>
      </div>
    </footer>
  );
}
