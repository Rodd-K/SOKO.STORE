import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Must sit inside <ProtectedRoute />. Non-admins are sent back to the shop.
// (This only hides the UI: the real protection is the Row Level Security
// policies in soko_patch_2_admin.sql, which block non-admins at the database.)
export default function AdminRoute() {
  const { isAdmin, loading } = useAuth();
  if (loading) {
    return <p className="px-4 py-20 text-center text-sm text-ink/60">Loading…</p>;
  }
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
