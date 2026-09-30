import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/** Wrap routes that need login. Pass requiredRoles to also gate by role. */
export default function ProtectedRoute({ requiredRoles }) {
  const { token, user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles?.length) {
    const hasRole = user?.roles?.some((r) => requiredRoles.includes(r));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}