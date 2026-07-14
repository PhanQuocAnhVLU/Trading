import { createBrowserRouter, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminAuthLayout from '../layouts/AdminAuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import { RequireAuth, RequireRole } from './RequireAuth';
import NotFoundPage from '../NotFoundPage';
import PageLoader from '../../shared/components/PageLoader';

const LoginPage = lazy(() => import('../../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../../features/auth/RegisterPage'));
const AdminLoginPage = lazy(() => import('../../features/auth/AdminLoginPage'));
const DashboardPage = lazy(() => import('../../features/dashboard/DashboardPage'));
const MarketPage = lazy(() => import('../../features/market/MarketPage'));
const StockDetailPage = lazy(() => import('../../features/market/StockDetailPage'));
const TradingPage = lazy(() => import('../../features/trading/TradingPage'));
const PortfolioPage = lazy(() => import('../../features/portfolio/PortfolioPage'));
const WatchlistPage = lazy(() => import('../../features/watchlist/WatchlistPage'));
const AlertsPage = lazy(() => import('../../features/alerts/AlertsPage'));
const ReportsPage = lazy(() => import('../../features/reports/ReportsPage'));
const SettingsPage = lazy(() => import('../../features/settings/SettingsPage'));
const AdminPage = lazy(() => import('../../features/admin/AdminPage'));

function withSuspense(el) {
  return <Suspense fallback={<PageLoader />}>{el}</Suspense>;
}

export const router = createBrowserRouter([
  // Consumer-facing auth (no mention of admin anywhere here)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
    ],
  },

  // Consumer app
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: withSuspense(<DashboardPage />) },
          { path: '/market', element: withSuspense(<MarketPage />) },
          { path: '/market/:symbol', element: withSuspense(<StockDetailPage />) },
          { path: '/trading', element: withSuspense(<TradingPage />) },
          { path: '/portfolio', element: withSuspense(<PortfolioPage />) },
          { path: '/watchlist', element: withSuspense(<WatchlistPage />) },
          { path: '/alerts', element: withSuspense(<AlertsPage />) },
          { path: '/reports', element: withSuspense(<ReportsPage />) },
          { path: '/settings', element: withSuspense(<SettingsPage />) },
        ],
      },
    ],
  },

  // Internal admin console — separate URL, separate shell, not linked from consumer UI
  {
    element: <AdminAuthLayout />,
    children: [{ path: '/admin/login', element: withSuspense(<AdminLoginPage />) }],
  },
  {
    element: <RequireRole role="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [{ path: '/admin', element: withSuspense(<AdminPage />) }],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
]);
