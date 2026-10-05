import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-4 py-24 text-center">
      <p className="font-display text-5xl font-bold text-navy-900">404</p>
      <h1 className="mt-3 font-display text-xl font-bold text-navy-900">Page not found</h1>
      <p className="mt-2 text-ink/60">The page you're looking for doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-navy-800 px-6 py-3 text-sm font-semibold text-white hover:bg-navy-700"
      >
        Back to home
      </Link>
    </div>
  );
}
