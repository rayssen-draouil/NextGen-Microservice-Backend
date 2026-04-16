import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { cancelOrder, confirmOrder, createOrder, deleteOrder, fetchOrders, updateOrder } from '@/services/orderApi';

export default function ManageOrdersPage() {
  const { t } = useTranslation('admin');
  const [activeTab, setActiveTab] = useState('all');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [form, setForm] = useState({
    customerName: '',
    productName: '',
    quantity: 1,
    price: 0,
  });
  const [editForm, setEditForm] = useState({
    customerName: '',
    productName: '',
    quantity: 1,
    price: 0,
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const orders = await fetchOrders();
      setRows(
        orders.map((order) => ({
          id: order.id,
          customerName: order.customerName,
          productName: order.productName,
          quantity: order.quantity,
          price: order.price,
          totalAmount: order.totalAmount,
          status: order.status || 'PENDING',
          createdAt: order.createdAt ? new Date(order.createdAt).toLocaleString() : '-',
        })),
      );
    } catch (requestError) {
      setError(requestError.message || 'Unable to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: name === 'quantity' || name === 'price' ? Number(value) : value }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: name === 'quantity' || name === 'price' ? Number(value) : value }));
  };

  const openCreateOrderModal = () => {
    setForm({ customerName: '', productName: '', quantity: 1, price: 0 });
    setOpenCreateModal(true);
  };

  const openUpdateOrderModal = (order) => {
    setSelectedOrder(order);
    setEditForm({
      customerName: order.customerName || '',
      productName: order.productName || '',
      quantity: order.quantity || 1,
      price: order.price || 0,
    });
    setOpenEditModal(true);
  };

  const applyRowUpdate = (updatedOrder) => {
    setRows((currentRows) => currentRows.map((row) => (row.id === updatedOrder.id ? { ...row, ...updatedOrder } : row)));
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createOrder(form);
      setOpenCreateModal(false);
      setSuccessMessage('Order created successfully.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrder = async (event) => {
    event.preventDefault();

    if (!selectedOrder?.id) {
      setError('Unable to edit the selected order.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
          const updated = await updateOrder(selectedOrder.id, editForm);
      applyRowUpdate({
        id: updated.id || selectedOrder.id,
        customerName: updated.customerName || editForm.customerName,
        productName: updated.productName || editForm.productName,
        quantity: updated.quantity || editForm.quantity,
        price: updated.price || editForm.price,
        totalAmount: updated.totalAmount || (editForm.quantity * editForm.price),
            status: updated.status || selectedOrder.status,
        createdAt: updated.createdAt ? new Date(updated.createdAt).toLocaleString() : selectedOrder.createdAt,
      });
      setOpenEditModal(false);
      setSelectedOrder(null);
      setSuccessMessage('Order updated successfully.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    const confirmed = window.confirm(`Delete order ${order.id}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteOrder(order.id);
      setRows((currentRows) => currentRows.filter((row) => row.id !== order.id));
      setSuccessMessage('Order deleted successfully.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOrder = async (order) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const updated = await confirmOrder(order.id);
      applyRowUpdate({
        id: updated.id || order.id,
        customerName: updated.customerName || order.customerName,
        productName: updated.productName || order.productName,
        quantity: updated.quantity || order.quantity,
        price: updated.price || order.price,
        totalAmount: updated.totalAmount || order.totalAmount,
        status: updated.status || 'CONFIRMED',
        createdAt: updated.createdAt || order.createdAt,
      });
      setSuccessMessage('Order confirmed successfully.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message || 'Unable to confirm the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async (order) => {
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const updated = await cancelOrder(order.id);
      applyRowUpdate({
        id: updated.id || order.id,
        customerName: updated.customerName || order.customerName,
        productName: updated.productName || order.productName,
        quantity: updated.quantity || order.quantity,
        price: updated.price || order.price,
        totalAmount: updated.totalAmount || order.totalAmount,
        status: updated.status || 'CANCELLED',
        createdAt: updated.createdAt || order.createdAt,
      });
      setSuccessMessage('Order cancelled successfully.');
      await loadOrders();
    } catch (requestError) {
      setError(requestError.message || 'Unable to cancel the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-heading font-bold text-primary">{t('pages.manageOrders')}</h2>
        <button type="button" onClick={openCreateOrderModal} className="px-4 py-2 rounded-xl bg-card border border-border font-bold hover:bg-muted">{t('manage.addOrder') || 'Add order'}</button>
      </div>

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'preparing', 'delivered', 'cancelled'].map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-primary hover:bg-muted'}`}>
            {t(`tabs.${tab}`)}
          </button>
        ))}
      </div>

      <DataTable
        headers={[t('table.orderId'), t('table.customer'), t('table.restaurant'), t('table.amount'), t('table.status'), t('table.date'), t('table.actions')]}
        rows={rows}
        renderRow={(row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="py-4 font-bold text-primary">#{row.id}</td>
            <td className="py-4 text-muted-foreground">{row.customerName}</td>
            <td className="py-4 text-muted-foreground">{row.productName}</td>
            <td className="py-4 text-primary">EUR {Number(row.totalAmount || row.price || 0).toFixed(2)}</td>
            <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.status}</span></td>
            <td className="py-4 text-muted-foreground">{row.createdAt}</td>
            <td className="py-4 flex items-center gap-2">
              <button type="button" onClick={() => handleConfirmOrder(row)} disabled={isSubmitting} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20">Confirm</button>
              <button type="button" onClick={() => handleCancelOrder(row)} disabled={isSubmitting} className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">Cancel</button>
              <button type="button" onClick={() => openUpdateOrderModal(row)} className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">{t('manage.edit')}</button>
              <button type="button" onClick={() => handleDeleteOrder(row)} disabled={isSubmitting} className="px-3 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-bold hover:bg-destructive/20">{t('manage.delete')}</button>
            </td>
          </tr>
        )}
      />

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading orders from the Spring service...</p>}

      <Pagination />

      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} title={t('manage.addOrder') || 'Add order'} size="sm">
        <form className="space-y-3" onSubmit={handleCreateOrder}>
          <input name="customerName" value={form.customerName} onChange={handleFormChange} type="text" placeholder="Customer name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="productName" value={form.productName} onChange={handleFormChange} type="text" placeholder="Product name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="quantity" value={form.quantity} onChange={handleFormChange} type="number" min="1" placeholder="Quantity" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="price" value={form.price} onChange={handleFormChange} type="number" min="0" step="0.01" placeholder="Price" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Creating...' : 'Create order'}</button>
        </form>
      </Modal>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title={t('manage.edit')} size="sm">
        <form className="space-y-3" onSubmit={handleUpdateOrder}>
          <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">Editing order #{selectedOrder?.id}</div>
          <input name="customerName" value={editForm.customerName} onChange={handleEditFormChange} type="text" placeholder="Customer name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="productName" value={editForm.productName} onChange={handleEditFormChange} type="text" placeholder="Product name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="quantity" value={editForm.quantity} onChange={handleEditFormChange} type="number" min="1" placeholder="Quantity" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="price" value={editForm.price} onChange={handleEditFormChange} type="number" min="0" step="0.01" placeholder="Price" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpenEditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-border font-bold text-primary hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Updating...' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
