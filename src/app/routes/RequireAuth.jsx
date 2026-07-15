import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import PageLoader from '../../shared/components/PageLoader';

export function RequireAuth() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);
  const location = useLocation();
  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <Outlet />;
}

export function RequireRole({ role }) {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.authLoading);
  if (authLoading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}
