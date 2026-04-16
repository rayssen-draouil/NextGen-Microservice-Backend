import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { createDelivery, deleteDelivery, fetchDeliveries, updateDelivery } from '@/services/deliveryApi';
import { fetchOrders } from '@/services/orderApi';

export default function ManageDeliveriesPage() {
  const { t } = useTranslation('admin');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [form, setForm] = useState({
    dateLivraison: '',
    statut: 'En préparation',
    adresseLivraison: '',
    fraisLivraison: '',
  });
  const [editForm, setEditForm] = useState({
    dateLivraison: '',
    statut: 'En préparation',
    adresseLivraison: '',
    fraisLivraison: '',
  });

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const deliveriesPayload = await fetchDeliveries();
      const deliveries = Array.isArray(deliveriesPayload)
        ? deliveriesPayload
        : Array.isArray(deliveriesPayload?.value)
          ? deliveriesPayload.value
          : Array.isArray(deliveriesPayload?.data)
            ? deliveriesPayload.data
            : Array.isArray(deliveriesPayload?.content)
              ? deliveriesPayload.content
              : [];

      if (deliveries.length > 0) {
        const ordersPayload = await fetchOrders().catch(() => []);
        const orders = Array.isArray(ordersPayload)
          ? ordersPayload
          : Array.isArray(ordersPayload?.value)
            ? ordersPayload.value
            : Array.isArray(ordersPayload?.data)
              ? ordersPayload.data
              : [];

        const orderByDeliveryId = new Map();
        orders.forEach((order) => {
          const deliveryIds = Array.isArray(order?.deliveryIds) ? order.deliveryIds : [];
          deliveryIds.forEach((deliveryId) => {
            orderByDeliveryId.set(String(deliveryId), order);
          });
        });

        setRows(
          deliveries.map((delivery) => ({
            id: delivery.idLivraison,
            dateLivraison: delivery.dateLivraison,
            statut: delivery.statut,
            adresseLivraison: delivery.adresseLivraison,
            fraisLivraison: delivery.fraisLivraison,
            livreurName:
              orderByDeliveryId.get(String(delivery.idLivraison))?.assignedLivreurName
              || orderByDeliveryId.get(String(delivery.idLivraison))?.assignedLivreurEmail
              || delivery.livreurName
              || '-',
            source: 'livraison',
          })),
        );
      } else {
        const ordersPayload = await fetchOrders().catch(() => []);
        const orders = Array.isArray(ordersPayload)
          ? ordersPayload
          : Array.isArray(ordersPayload?.value)
            ? ordersPayload.value
            : Array.isArray(ordersPayload?.data)
              ? ordersPayload.data
              : [];

        setRows(
          orders.map((order) => ({
            id: order.id,
            dateLivraison: order.createdAt ? new Date(order.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            statut: order.status || 'ASSIGNED',
            adresseLivraison: '-',
            fraisLivraison: 0,
            livreurName: order.assignedLivreurName || order.assignedLivreurEmail || '-',
            source: 'order-fallback',
          })),
        );

        if (orders.length > 0) {
          setSuccessMessage('No delivery entities found. Showing delivery-related orders instead.');
        }
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to load deliveries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const openCreateDeliveryModal = () => {
    setForm({ dateLivraison: '', statut: 'En préparation', adresseLivraison: '', fraisLivraison: '' });
    setOpenCreateModal(true);
  };

  const openUpdateDeliveryModal = (delivery) => {
    setSelectedDelivery(delivery);
    setEditForm({
      dateLivraison: delivery.dateLivraison || '',
      statut: delivery.statut || 'En préparation',
      adresseLivraison: delivery.adresseLivraison || '',
      fraisLivraison: delivery.fraisLivraison ?? '',
    });
    setOpenEditModal(true);
  };

  const handleCreateDelivery = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createDelivery({
        dateLivraison: form.dateLivraison,
        statut: form.statut,
        adresseLivraison: form.adresseLivraison,
        fraisLivraison: Number(form.fraisLivraison),
      });
      setOpenCreateModal(false);
      setSuccessMessage('Delivery created successfully.');
      await loadDeliveries();
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDelivery = async (event) => {
    event.preventDefault();

    if (!selectedDelivery?.id) {
      setError('Unable to edit the selected delivery.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateDelivery(selectedDelivery.id, {
        dateLivraison: editForm.dateLivraison,
        statut: editForm.statut,
        adresseLivraison: editForm.adresseLivraison,
        fraisLivraison: Number(editForm.fraisLivraison),
      });
      setOpenEditModal(false);
      setSelectedDelivery(null);
      setSuccessMessage('Delivery updated successfully.');
      await loadDeliveries();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDelivery = async (delivery) => {
    if (delivery.source !== 'livraison') {
      setError('This row comes from orders fallback and cannot be deleted as a delivery.');
      return;
    }

    const confirmed = window.confirm(`Delete delivery #${delivery.id}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteDelivery(delivery.id);
      setRows((currentRows) => currentRows.filter((row) => row.id !== delivery.id));
      setSuccessMessage('Delivery deleted successfully.');
      await loadDeliveries();
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the delivery.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-heading font-bold text-primary">Deliveries</h2>
        <button type="button" onClick={openCreateDeliveryModal} className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all">Add delivery</button>
      </div>

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

      <DataTable
        headers={['ID', 'Date', 'Livreur', 'Status', 'Address', 'Fees', 'Actions']}
        rows={rows}
        renderRow={(row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="py-4 font-bold text-primary">#{row.id}</td>
            <td className="py-4 text-muted-foreground">{row.dateLivraison || '-'}</td>
            <td className="py-4 text-muted-foreground">{row.livreurName || '-'}</td>
            <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.statut}</span></td>
            <td className="py-4 text-muted-foreground">{row.adresseLivraison || '-'}</td>
            <td className="py-4 text-primary">EUR {Number(row.fraisLivraison || 0).toFixed(2)}</td>
            <td className="py-4 flex items-center gap-2">
              <button type="button" onClick={() => openUpdateDeliveryModal(row)} disabled={row.source !== 'livraison'} className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed">Edit</button>
              <button type="button" onClick={() => handleDeleteDelivery(row)} disabled={isSubmitting || row.source !== 'livraison'} className="px-3 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-bold hover:bg-destructive/20 disabled:opacity-60 disabled:cursor-not-allowed">Delete</button>
            </td>
          </tr>
        )}
      />

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading deliveries from the Spring service...</p>}

      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} title="Add delivery" size="sm">
        <form className="space-y-3" onSubmit={handleCreateDelivery}>
          <input name="dateLivraison" value={form.dateLivraison} onChange={handleFormChange} type="date" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="adresseLivraison" value={form.adresseLivraison} onChange={handleFormChange} type="text" placeholder="Delivery address" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="fraisLivraison" value={form.fraisLivraison} onChange={handleFormChange} type="number" step="0.01" min="0" placeholder="Delivery fee" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <Select name="statut" value={form.statut} onChange={handleFormChange}>
            <option value="En préparation">En préparation</option>
            <option value="Expédiée">Expédiée</option>
            <option value="Livrée">Livrée</option>
            <option value="Retardée">Retardée</option>
          </Select>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Creating...' : 'Create delivery'}</button>
        </form>
      </Modal>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title="Edit delivery" size="sm">
        <form className="space-y-3" onSubmit={handleUpdateDelivery}>
          <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">Editing delivery #{selectedDelivery?.id}</div>
          <input name="dateLivraison" value={editForm.dateLivraison} onChange={handleEditFormChange} type="date" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="adresseLivraison" value={editForm.adresseLivraison} onChange={handleEditFormChange} type="text" placeholder="Delivery address" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="fraisLivraison" value={editForm.fraisLivraison} onChange={handleEditFormChange} type="number" step="0.01" min="0" placeholder="Delivery fee" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <Select name="statut" value={editForm.statut} onChange={handleEditFormChange}>
            <option value="En préparation">En préparation</option>
            <option value="Expédiée">Expédiée</option>
            <option value="Livrée">Livrée</option>
            <option value="Retardée">Retardée</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpenEditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-border font-bold text-primary hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Updating...' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
