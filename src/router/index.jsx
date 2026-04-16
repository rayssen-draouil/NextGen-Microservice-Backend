import { createBrowserRouter, Navigate } from 'react-router-dom';

import FrontLayout from '@/components/layout/FrontLayout';
import BackLayout from '@/components/layout/BackLayout';

import HomePage from '@/pages/front/HomePage';
import AuthPage from '@/pages/auth/AuthPage';
import RestaurantsPage from '@/pages/front/RestaurantsPage';
import MenuDetailPage from '@/pages/front/MenuDetailPage';
import CartPage from '@/pages/front/CartPage';
import CheckoutPage from '@/pages/front/CheckoutPage';
import OrdersPage from '@/pages/front/OrdersPage';
import OrderArrivalPage from '@/pages/front/OrderArrivalPage';
import ReviewsPage from '@/pages/front/ReviewsPage';
import NotFoundPage from '@/pages/NotFoundPage';

import DashboardPage from '@/pages/back/DashboardPage';
import ManageDeliveriesPage from '@/pages/back/ManageDeliveriesPage';
import ManageRestaurantsPage from '@/pages/back/ManageRestaurantsPage';
import ManageMenusPage from '@/pages/back/ManageMenusPage';
import ManageOrdersPage from '@/pages/back/ManageOrdersPage';
import ManageIntegrationsPage from '@/pages/back/ManageIntegrationsPage';
import ManageReclamationsPage from '@/pages/back/ManageReclamationsPage';
import ManageUsersPage from '@/pages/back/ManageUsersPage';
import { getStoredSession, normalizeRole } from '@/services/userApi';

function RestaurantsRoute() {
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);

  if (role === 'restaurant' || role === 'admin') {
    return (
      <RequireRoles allowedRoles={['admin', 'restaurant']}>
        <ManageRestaurantsPage />
      </RequireRoles>
    );
  }

  return <RestaurantsPage />;
}

function MenusRoute() {
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'restaurant' && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <ManageMenusPage />;
}

function RequireAuth({ children }) {
  const session = getStoredSession();

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function RequireRoles({ children, allowedRoles }) {
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);

  if (!session?.user) {
    return <Navigate to="/auth" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function RequireClient({ children }) {
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  if (role !== 'client') {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <FrontLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'restaurants', element: <RestaurantsRoute /> },
      { path: 'menus', element: <MenusRoute /> },
      { path: 'restaurants/:id/menu', element: <MenuDetailPage /> },
      { path: 'cart', element: <RequireClient><CartPage /></RequireClient> },
      { path: 'checkout', element: <RequireClient><CheckoutPage /></RequireClient> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'order-arrival', element: <OrderArrivalPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
    ],
  },
  {
    path: '/admin',
    element: <RequireAuth><BackLayout /></RequireAuth>,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <RequireRoles allowedRoles={['admin']}><DashboardPage /></RequireRoles> },
      { path: 'restaurants', element: <RequireRoles allowedRoles={['admin', 'restaurant']}><ManageRestaurantsPage /></RequireRoles> },
      { path: 'menus', element: <RequireRoles allowedRoles={['admin', 'restaurant']}><ManageMenusPage /></RequireRoles> },
      { path: 'orders', element: <RequireRoles allowedRoles={['admin']}><ManageOrdersPage /></RequireRoles> },
      { path: 'deliveries', element: <RequireRoles allowedRoles={['admin']}><ManageDeliveriesPage /></RequireRoles> },
      { path: 'reclamations', element: <RequireRoles allowedRoles={['admin', 'restaurant']}><ManageReclamationsPage /></RequireRoles> },
      { path: 'integrations', element: <RequireRoles allowedRoles={['admin']}><ManageIntegrationsPage /></RequireRoles> },
      { path: 'users', element: <RequireRoles allowedRoles={['admin']}><ManageUsersPage /></RequireRoles> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;
