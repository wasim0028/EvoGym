import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the refresh-cookie check before deciding — otherwise a signed-in
  // member gets bounced to /login on every hard refresh.
  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="eyebrow animate-pulse">Loading</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
