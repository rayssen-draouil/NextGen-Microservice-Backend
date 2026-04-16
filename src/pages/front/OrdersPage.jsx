import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import OrderStatusStep from '@/components/shared/OrderStatusStep';
import { fetchOrders, fetchOrdersByLivreur, fetchOrdersByRestaurant, updateOrder } from '@/services/orderApi';
import { fetchRestaurantOrders } from '@/services/restaurantApi';
import { fetchDeliveries } from '@/services/deliveryApi';
import { fetchRestaurants } from '@/services/restaurantApi';
import { fetchUsers, getStoredSession, normalizeRole } from '@/services/userApi';

function buildStatusSummary(orders) {
  const summary = orders.reduce(
    (accumulator, order) => {
      const status = String(order.status || 'PENDING').toUpperCase();
      accumulator[status] = (accumulator[status] || 0) + 1;
      return accumulator;
    },
    { PENDING: 0, ASSIGNED: 0, CONFIRMED: 0, CANCELLED: 0, DELIVERED: 0 },
  );

  return summary;
}

export default function OrdersPage() {
  const { t } = useTranslation('orders');
  const navigate = useNavigate();
  const [session] = useState(() => getStoredSession());
  const role = normalizeRole(session?.user?.role);
  const authToken = session?.accessToken || session?.access_token || '';

  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [livreurs, setLivreurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [livreurSelection, setLivreurSelection] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let sourceOrders = [];

      if (role === 'restaurant') {
        const sessionEmail = String(session?.user?.email || '').toLowerCase();
        let resolvedRestaurantId = session?.user?.restaurantId ? Number(session.user.restaurantId) : null;

        if (!resolvedRestaurantId) {
          const restaurantsPayload = await fetchRestaurants();
          const normalizedRestaurants = Array.isArray(restaurantsPayload)
            ? restaurantsPayload
            : Array.isArray(restaurantsPayload?.value)
              ? restaurantsPayload.value
              : [];

          const linkedRestaurant = normalizedRestaurants.find(
            (restaurant) => String(restaurant.email || '').toLowerCase() === sessionEmail,
          ) || (normalizedRestaurants.length === 1 ? normalizedRestaurants[0] : null);

          resolvedRestaurantId = linkedRestaurant?.id ? Number(linkedRestaurant.id) : null;
        }

        if (resolvedRestaurantId) {
          sourceOrders = await fetchOrdersByRestaurant(resolvedRestaurantId);
        } else {
          sourceOrders = await fetchRestaurantOrders();
        }
      } else if (role === 'livreur') {
        const livreurId = String(session?.user?.id || session?.user?._id || session?.user?.userId || '').trim();
        const livreurEmail = String(session?.user?.email || '').toLowerCase();

        if (livreurId) {
          try {
            sourceOrders = await fetchOrdersByLivreur(livreurId);
          } catch {
            const allOrders = await fetchOrders();
            sourceOrders = Array.isArray(allOrders)
              ? allOrders.filter((order) => String(order.assignedLivreurEmail || '').toLowerCase() === livreurEmail)
              : [];
          }
        } else if (livreurEmail) {
          const allOrders = await fetchOrders();
          sourceOrders = Array.isArray(allOrders)
            ? allOrders.filter((order) => String(order.assignedLivreurEmail || '').toLowerCase() === livreurEmail)
            : [];
        } else {
          sourceOrders = [];
        }
      } else {
        sourceOrders = await fetchOrders();
      }

      setOrders(Array.isArray(sourceOrders) ? sourceOrders : []);

      if (role === 'restaurant' || role === 'admin') {
        if (!authToken) {
          setLivreurs([]);
        } else {
          try {
            const availableUsers = await fetchUsers(authToken);
            setLivreurs(
              Array.isArray(availableUsers)
                ? availableUsers.filter((user) => String(user.role || '').toLowerCase() === 'livreur')
                : [],
            );
          } catch (userRequestError) {
            setLivreurs([]);
            setError(userRequestError.message || 'Unable to load livreurs.');
          }
        }
      } else {
        setLivreurs([]);
      }

      if (role === 'livreur') {
        try {
          const response = await fetchDeliveries();
          setDeliveries(Array.isArray(response) ? response : []);
        } catch {
          setDeliveries([]);
        }
      } else {
        setDeliveries([]);
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, [role, authToken]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const visibleOrders = useMemo(() => {
    if (role === 'client') {
      const identity = [session?.user?.name, session?.user?.email].filter(Boolean).map((value) => String(value).toLowerCase());

      if (!identity.length) {
        return orders;
      }

      return orders.filter((order) => {
        const customerName = String(order.customerName || '').toLowerCase();
        return identity.some((token) => customerName.includes(token));
      });
    }

    return orders;
  }, [orders, role, session?.user?.email, session?.user?.name]);

  const statusSummary = useMemo(() => buildStatusSummary(visibleOrders), [visibleOrders]);

  const latestOrder = visibleOrders[0] || null;
  const latestOrderStatus = String(latestOrder?.status || 'PENDING').toUpperCase();

  const handleAssignLivreur = async (order) => {
    const livreurId = livreurSelection[order.id];

    if (!livreurId) {
      setError('Select a livreur before assigning the order.');
      return;
    }

    const selectedLivreur = livreurs.find((item) => String(item.id) === String(livreurId));

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const updatedOrder = await updateOrder(order.id, {
        ...order,
        status: 'ASSIGNED',
        assignedLivreurId: String(livreurId),
        assignedLivreurName: selectedLivreur?.name || selectedLivreur?.email || `Livreur #${livreurId}`,
        assignedLivreurEmail: selectedLivreur?.email || '',
      });
      setOrders((currentOrders) => currentOrders.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)));
      setSuccessMessage(`Order #${updatedOrder.id} assigned to ${selectedLivreur?.name || `Livreur #${livreurId}`}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to assign the livreur.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (order, status) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const updatedOrder = await updateOrder(order.id, { ...order, status });
      setOrders((currentOrders) => currentOrders.map((item) => (item.id === updatedOrder.id ? updatedOrder : item)));
      setSuccessMessage(`Order #${updatedOrder.id} marked as ${status}.`);
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the order status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderClientView = () => (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.10),_transparent_28%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-secondary">Client</p>
            <h2 className="text-3xl font-heading font-bold text-primary">My orders</h2>
            <p className="text-muted-foreground mt-2">Track the orders submitted with your account and keep following their progress.</p>
          </div>
          <button type="button" onClick={() => navigate('/checkout')} className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition-all hover:scale-[1.01]">
            Place a new order
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="text-3xl font-bold text-primary">{statusSummary.PENDING}</p></div>
        <div className="rounded-3xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">In progress</p><p className="text-3xl font-bold text-primary">{statusSummary.ASSIGNED + statusSummary.CONFIRMED}</p></div>
        <div className="rounded-3xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Delivered</p><p className="text-3xl font-bold text-primary">{statusSummary.DELIVERED}</p></div>
      </div>

      <div className="bg-card rounded-3xl border border-border p-6">
        <DataTable
          headers={['ID', 'Product', 'Status', 'Total', 'Assigned livreur']}
          rows={visibleOrders}
          renderRow={(order) => (
            <tr key={order.id} className="border-t border-border">
              <td className="py-4 font-bold text-primary">#{order.id}</td>
              <td className="py-4 text-muted-foreground">{order.productName}</td>
              <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{order.status || 'PENDING'}</span></td>
              <td className="py-4 text-primary">EUR {Number(order.totalAmount || order.price || 0).toFixed(2)}</td>
              <td className="py-4 text-muted-foreground">{order.assignedLivreurName || '-'}</td>
            </tr>
          )}
        />
      </div>
    </div>
  );

  const renderRestaurantView = () => (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(245,158,11,0.08),_rgba(16,185,129,0.06),_transparent_70%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Restaurant</p>
            <h2 className="text-3xl font-heading font-bold text-primary">Incoming orders for your single restaurant</h2>
            <p className="text-muted-foreground mt-2">This account is limited to one restaurant view. Review each submitted order, then affect a livreur before confirmation.</p>
          </div>
          <div className="rounded-2xl bg-muted/60 border border-border px-4 py-3 text-sm text-muted-foreground shadow-sm">
            <p className="font-bold text-primary">Connected restaurant account</p>
            <p>Orders are shown from the restaurant service relation endpoint.</p>
          </div>
        </div>
      </section>

      <div className="bg-card rounded-3xl border border-border p-6">
        <DataTable
          headers={['ID', 'Customer', 'Product', 'Status', 'Livreur', 'Action']}
          rows={visibleOrders}
          renderRow={(order) => (
            <tr key={order.id} className="border-t border-border align-top">
              <td className="py-4 font-bold text-primary">#{order.id}</td>
              <td className="py-4 text-muted-foreground">{order.customerName}</td>
              <td className="py-4 text-muted-foreground">{order.productName}</td>
              <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{order.status || 'PENDING'}</span></td>
              <td className="py-4 text-muted-foreground">
                <div className="space-y-2 min-w-72">
                  <Select value={livreurSelection[order.id] || ''} onChange={(event) => setLivreurSelection((current) => ({ ...current, [order.id]: event.target.value }))}>
                    <option value="">Select livreur</option>
                    {livreurs.map((livreur) => (
                      <option key={livreur.id} value={livreur.id}>
                        {livreur.name || livreur.email} - {livreur.email}
                      </option>
                    ))}
                  </Select>
                  <p className="text-xs text-muted-foreground">Assigned: {order.assignedLivreurName || 'None'}</p>
                </div>
              </td>
              <td className="py-4">
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={isSubmitting || String(order.status || '').toUpperCase() !== 'PENDING'} onClick={() => handleAssignLivreur(order)} className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20 disabled:opacity-70">
                    Affect livreur
                  </button>
                  <button type="button" disabled={isSubmitting || String(order.status || '').toUpperCase() === 'DELIVERED'} onClick={() => handleUpdateStatus(order, 'DELIVERED')} className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-primary hover:bg-background disabled:opacity-70">
                    Mark delivered
                  </button>
                </div>
              </td>
            </tr>
          )}
        />
      </div>
    </div>
  );

  const renderLivreurView = () => (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.09),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_30%)]" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-tertiary">Livreur</p>
            <h2 className="text-3xl font-heading font-bold text-primary">Assigned deliveries</h2>
            <p className="text-muted-foreground mt-2">View deliveries already assigned to your role and update the delivery status when needed.</p>
          </div>
          <button type="button" onClick={() => navigate('/order-arrival')} className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition-all hover:scale-[1.01]">
            Open live tracking
          </button>
        </div>
      </section>

      <div className="bg-card rounded-3xl border border-border p-6">
        <DataTable
          headers={visibleOrders.length > 0 ? ['ID', 'Customer', 'Product', 'Status', 'Total', 'Action'] : ['ID', 'Date', 'Status', 'Address', 'Fees', 'Action']}
          rows={visibleOrders.length > 0 ? visibleOrders : deliveries}
          renderRow={(row) => (
            visibleOrders.length > 0 ? (
              <tr key={row.id} className="border-t border-border">
                <td className="py-4 font-bold text-primary">#{row.id}</td>
                <td className="py-4 text-muted-foreground">{row.customerName || '-'}</td>
                <td className="py-4 text-muted-foreground">{row.productName || '-'}</td>
                <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.status || 'PENDING'}</span></td>
                <td className="py-4 text-primary">EUR {Number(row.totalAmount || row.price || 0).toFixed(2)}</td>
                <td className="py-4">
                  <button type="button" onClick={() => navigate('/order-arrival')} className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-primary hover:bg-background">
                    Track
                  </button>
                </td>
              </tr>
            ) : (
              <tr key={row.idLivraison} className="border-t border-border">
                <td className="py-4 font-bold text-primary">#{row.idLivraison}</td>
                <td className="py-4 text-muted-foreground">{row.dateLivraison || '-'}</td>
                <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.statut || '-'}</span></td>
                <td className="py-4 text-muted-foreground">{row.adresseLivraison || '-'}</td>
                <td className="py-4 text-primary">EUR {Number(row.fraisLivraison || 0).toFixed(2)}</td>
                <td className="py-4">
                  <button type="button" onClick={() => navigate('/order-arrival')} className="rounded-lg bg-muted px-3 py-2 text-xs font-bold text-primary hover:bg-background">
                    Track
                  </button>
                </td>
              </tr>
            )
          )}
        />
      </div>
    </div>
  );

  const renderAdminView = () => (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Admin</p>
            <h2 className="text-3xl font-heading font-bold text-primary">Order progress overview</h2>
            <p className="text-muted-foreground mt-2">Track how many orders are pending, assigned and delivered across the platform.</p>
          </div>
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition-all hover:scale-[1.01]">
            Open dashboard
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          ['Pending', statusSummary.PENDING],
          ['Assigned', statusSummary.ASSIGNED],
          ['Confirmed', statusSummary.CONFIRMED],
          ['Delivered', statusSummary.DELIVERED],
          ['Cancelled', statusSummary.CANCELLED],
        ].map(([label, value]) => (
          <div key={label} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <DataTable
            headers={['ID', 'Customer', 'Product', 'Status', 'Delivery ids']}
            rows={visibleOrders.slice(0, 8)}
            renderRow={(order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="py-4 font-bold text-primary">#{order.id}</td>
                <td className="py-4 text-muted-foreground">{order.customerName}</td>
                <td className="py-4 text-muted-foreground">{order.productName}</td>
                <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{order.status || 'PENDING'}</span></td>
                <td className="py-4 text-muted-foreground">{Array.isArray(order.deliveryIds) && order.deliveryIds.length ? order.deliveryIds.join(', ') : '-'}</td>
              </tr>
            )}
          />
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-xl font-heading font-bold text-primary">Latest journey</h3>
          <OrderStatusStep complete title="Submitted" time="Client placed order" />
          <OrderStatusStep complete={statusSummary.ASSIGNED > 0 || statusSummary.CONFIRMED > 0 || statusSummary.DELIVERED > 0} active={statusSummary.ASSIGNED > 0} title="Assigned" time="Restaurant picked a delivery" />
          <OrderStatusStep complete={statusSummary.DELIVERED > 0} active={statusSummary.CONFIRMED > 0} title="Delivered" time="Delivery completed" />
          <OrderStatusStep title="Archived" time="Closed orders" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

      {role === 'restaurant' && renderRestaurantView()}
      {role === 'livreur' && renderLivreurView()}
      {role === 'admin' && renderAdminView()}
      {role === 'client' && renderClientView()}

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading role-specific orders...</p>}
      <Pagination />

      {role !== 'client' && (
        <Modal open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} title={selectedOrder ? `Order #${selectedOrder.id}` : 'Order details'} size="sm">
          {selectedOrder && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">
                {selectedOrder.customerName} - {selectedOrder.productName}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-bold text-secondary-foreground">{selectedOrder.status || 'PENDING'}</span>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}