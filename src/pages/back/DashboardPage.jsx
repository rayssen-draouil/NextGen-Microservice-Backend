import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import StatCard from '@/components/shared/StatCard';
import DataTable from '@/components/ui/DataTable';
import { fetchOrders } from '@/services/orderApi';
import { fetchDeliveries } from '@/services/deliveryApi';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

export default function DashboardPage() {
  const { t } = useTranslation('admin');
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const swaggerUrl = `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:16604').replace(/\/$/, '')}/swagger-ui.html`;

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [ordersData, deliveriesData] = await Promise.all([fetchOrders(), fetchDeliveries()]);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setDeliveries(Array.isArray(deliveriesData) ? deliveriesData : []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const primaryColor =
    typeof window !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()
      : 'var(--primary)';

  const statusCounts = useMemo(
    () =>
      orders.reduce(
        (accumulator, order) => {
          const status = String(order.status || 'PENDING').toUpperCase();
          accumulator[status] = (accumulator[status] || 0) + 1;
          return accumulator;
        },
        { PENDING: 0, ASSIGNED: 0, CONFIRMED: 0, DELIVERED: 0, CANCELLED: 0 },
      ),
    [orders],
  );

  const data = useMemo(
    () => ({
      labels: ['Pending', 'Assigned', 'Confirmed', 'Delivered', 'Cancelled'],
      datasets: [
        {
          label: t('stats.totalOrders'),
          data: [
            statusCounts.PENDING,
            statusCounts.ASSIGNED,
            statusCounts.CONFIRMED,
            statusCounts.DELIVERED,
            statusCounts.CANCELLED,
          ],
          backgroundColor: primaryColor,
          borderRadius: 12,
        },
      ],
    }),
    [primaryColor, statusCounts, t],
  );

  const recentOrders = useMemo(
    () =>
      orders.slice(0, 5).map((order) => ({
        id: `#ORD-${order.id}`,
        customer: order.customerName,
        restaurant: order.productName,
        amount: `EUR ${Number(order.totalAmount || order.price || 0).toFixed(2)}`,
        status: order.status || 'PENDING',
        date: order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-',
        livreur: order.assignedLivreurName || '-',
      })),
    [orders],
  );

  return (
    <div className="space-y-10">
      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary">Admin dashboard</h2>
          <p className="text-sm text-muted-foreground">Open API reference quickly from here.</p>
        </div>
        <a href={swaggerUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground transition-all hover:opacity-90">
          <Icon icon="lucide:file-text" className="text-lg" />
          Swagger documentation
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard icon="lucide:shopping-bag" trend={`${statusCounts.PENDING} pending`} label={t('stats.totalOrders')} value={String(orders.length || 0)} />
        <StatCard icon="lucide:credit-card" trend={`${statusCounts.ASSIGNED} assigned`} label={t('stats.revenue')} value={`EUR ${orders.reduce((sum, order) => sum + Number(order.totalAmount || order.price || 0), 0).toFixed(2)}`} tone="secondary" />
        <StatCard icon="lucide:truck" trend={`${deliveries.length} deliveries`} label={t('stats.avgRating')} value={String(statusCounts.DELIVERED)} tone="tertiary" />
        <StatCard icon="lucide:clock" trend={`${statusCounts.CONFIRMED} in progress`} label={t('stats.prepTime')} value={String(statusCounts.CANCELLED)} tone="secondary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-card p-8 rounded-3xl border border-border shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-primary font-bold">
            <Icon icon="lucide:chart-bar" className="text-2xl" />
            <span>{t('stats.totalOrders')}</span>
          </div>
          <Bar data={data} />
        </div>

        <div className="bg-card p-8 rounded-3xl border border-border shadow-sm">
          <h3 className="text-xl font-heading font-bold text-primary mb-6">Progress</h3>
          <div className="space-y-4">
            {[
              { label: 'Pending', value: statusCounts.PENDING },
              { label: 'Assigned', value: statusCounts.ASSIGNED },
              { label: 'Confirmed', value: statusCounts.CONFIRMED },
              { label: 'Delivered', value: statusCounts.DELIVERED },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-muted rounded-2xl">
                <span className="font-medium text-primary">{item.label}</span>
                <span className="text-xs font-bold text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        headers={[t('table.orderId'), t('table.customer'), t('table.restaurant'), t('table.amount'), t('table.status'), 'Livreur', t('table.date'), t('table.actions')]}
        rows={recentOrders}
        renderRow={(row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="py-4 font-bold text-primary">{row.id}</td>
            <td className="py-4 text-muted-foreground">{row.customer}</td>
            <td className="py-4 text-muted-foreground">{row.restaurant}</td>
            <td className="py-4 text-primary">{row.amount}</td>
            <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.status}</span></td>
            <td className="py-4 text-muted-foreground">{row.livreur}</td>
            <td className="py-4 text-muted-foreground">{row.date}</td>
            <td className="py-4 flex items-center gap-2">
              <button type="button" className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">{t('manage.view')}</button>
              <button type="button" className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">{t('manage.edit')}</button>
            </td>
          </tr>
        )}
      />

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading dashboard progress...</p>}
    </div>
  );
}
