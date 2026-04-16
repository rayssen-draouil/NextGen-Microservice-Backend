import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { getStoredSession, normalizeRole } from '@/services/userApi';
import {
  createRestaurant,
  deleteRestaurant,
  fetchRestaurantOrders,
  fetchRestaurantReclamations,
  fetchRestaurants,
  updateRestaurant,
} from '@/services/restaurantApi';

export default function ManageRestaurantsPage() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);
  const sessionEmail = String(session?.user?.email || '').toLowerCase();
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openRelationsModal, setOpenRelationsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [relationOrders, setRelationOrders] = useState([]);
  const [relationReclamations, setRelationReclamations] = useState([]);
  const [relationLoading, setRelationLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    openingHours: '',
    status: 'OPEN',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    openingHours: '',
    status: 'OPEN',
  });

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const restaurants = await fetchRestaurants();
      const normalizedRows = restaurants.map((restaurant) => ({
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        openingHours: restaurant.openingHours,
        status: restaurant.status || 'OPEN',
      }));

      setAllRows(normalizedRows);

      if (role === 'restaurant') {
        setRows(
          normalizedRows.filter(
            (restaurant) => String(restaurant.email || '').toLowerCase() === sessionEmail,
          ),
        );
      } else {
        setRows(normalizedRows);
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to load restaurants.');
    } finally {
      setLoading(false);
    }
  }, [role, sessionEmail]);

  useEffect(() => {
    void loadRestaurants();
  }, [loadRestaurants]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const openCreateRestaurantModal = () => {
    if (role === 'restaurant' && rows.length >= 1) {
      setError('A restaurant manager account can only manage one restaurant.');
      return;
    }

    setForm({ name: '', address: '', phone: '', email: '', openingHours: '', status: 'OPEN' });
    setOpenCreateModal(true);
  };

  const openUpdateRestaurantModal = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setEditForm({
      name: restaurant.name || '',
      address: restaurant.address || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',
      openingHours: restaurant.openingHours || '',
      status: restaurant.status || 'OPEN',
    });
    setOpenEditModal(true);
  };

  const openRestaurantRelationsModal = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setRelationLoading(true);
    setError('');

    try {
      const [orders, reclamations] = await Promise.all([
        fetchRestaurantOrders(),
        fetchRestaurantReclamations(),
      ]);

      setRelationOrders(orders);
      setRelationReclamations(
        reclamations.filter((reclamation) => String(reclamation.restaurantId) === String(restaurant.id)),
      );
      setOpenRelationsModal(true);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load restaurant relations.');
    } finally {
      setRelationLoading(false);
    }
  };

  const handleCreateRestaurant = async (event) => {
    event.preventDefault();

    if (role === 'restaurant' && rows.length >= 1) {
      setError('A restaurant manager account can only create one restaurant.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        ...form,
        email: role === 'restaurant' ? session?.user?.email || form.email : form.email,
      };

      await createRestaurant(payload);
      setOpenCreateModal(false);
      setSuccessMessage('Restaurant created successfully. Now create at least one menu.');
      await loadRestaurants();

      if (role === 'restaurant') {
        navigate('/menus', { replace: true });
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the restaurant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRestaurant = async (event) => {
    event.preventDefault();

    if (!selectedRestaurant?.id) {
      setError('Unable to edit the selected restaurant.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateRestaurant(selectedRestaurant.id, editForm);
      setOpenEditModal(false);
      setSelectedRestaurant(null);
      setSuccessMessage('Restaurant updated successfully.');
      await loadRestaurants();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the restaurant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRestaurant = async (restaurant) => {
    const confirmed = window.confirm(`Delete ${restaurant.name}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteRestaurant(restaurant.id);
      setRows((currentRows) => currentRows.filter((row) => row.id !== restaurant.id));
      setSuccessMessage('Restaurant deleted successfully.');
      await loadRestaurants();
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the restaurant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-heading font-bold text-primary">{t('pages.manageRestaurants')}</h2>
        <button type="button" onClick={openCreateRestaurantModal} disabled={role === 'restaurant' && rows.length >= 1} className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">{t('manage.addRestaurant')}</button>
      </div>

      {role === 'restaurant' && (
        <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          Your role is limited to one restaurant linked to your account email.
        </div>
      )}

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
          <Icon icon="lucide:search" className="text-muted-foreground" />
          <input type="text" placeholder={t('header.search')} className="bg-transparent outline-none w-full text-sm" />
        </div>
        <button type="button" className="px-4 py-2 rounded-xl bg-card border border-border font-bold hover:bg-muted">{t('tabs.all')}</button>
      </div>

      <div className="bg-card rounded-3xl border border-border p-6">
        <DataTable
          headers={[t('manage.restaurant'), t('manage.location'), 'Phone', 'Email', 'Hours', t('manage.status'), t('table.actions')]}
          rows={rows}
          renderRow={(row) => (
            <tr key={row.id} className="border-t border-border">
              <td className="py-4 font-bold text-primary">{row.name}</td>
              <td className="py-4 text-muted-foreground">{row.address || '-'}</td>
              <td className="py-4 text-muted-foreground">{row.phone || '-'}</td>
              <td className="py-4 text-muted-foreground">{row.email || '-'}</td>
              <td className="py-4 text-muted-foreground">{row.openingHours || '-'}</td>
              <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.status}</span></td>
              <td className="py-4 flex items-center gap-2">
                <button type="button" onClick={() => openRestaurantRelationsModal(row)} className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20">{t('manage.relations') || 'Relations'}</button>
                <button type="button" onClick={() => openUpdateRestaurantModal(row)} className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">{t('manage.edit')}</button>
                {role === 'admin' && (
                  <button type="button" onClick={() => handleDeleteRestaurant(row)} disabled={isSubmitting} className="px-3 py-1 rounded-lg bg-destructive/15 border border-destructive/30 text-xs font-bold text-destructive hover:bg-destructive/20">{t('manage.delete')}</button>
                )}
              </td>
            </tr>
          )}
        />
      </div>

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading restaurants from the Spring service...</p>}

      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} title={t('manage.addRestaurant')} size="sm">
        <form className="space-y-3" onSubmit={handleCreateRestaurant}>
          <input name="name" value={form.name} onChange={handleFormChange} type="text" placeholder={t('manage.restaurant')} className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="address" value={form.address} onChange={handleFormChange} type="text" placeholder={t('manage.location')} className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <input name="phone" value={form.phone} onChange={handleFormChange} type="text" placeholder="Phone" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <input name="email" value={form.email} onChange={handleFormChange} type="email" placeholder="Email" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <input name="openingHours" value={form.openingHours} onChange={handleFormChange} type="text" placeholder="Opening hours" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <Select name="status" value={form.status} onChange={handleFormChange}>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </Select>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Creating...' : t('manage.addRestaurant')}</button>
        </form>
      </Modal>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title={t('manage.edit')} size="sm">
        <form className="space-y-3" onSubmit={handleUpdateRestaurant}>
          <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">
            Editing {selectedRestaurant?.name || 'restaurant'}
          </div>
          <input name="name" value={editForm.name} onChange={handleEditFormChange} type="text" placeholder={t('manage.restaurant')} className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="address" value={editForm.address} onChange={handleEditFormChange} type="text" placeholder={t('manage.location')} className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <input name="phone" value={editForm.phone} onChange={handleEditFormChange} type="text" placeholder="Phone" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <input name="email" value={editForm.email} onChange={handleEditFormChange} type="email" placeholder="Email" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <input name="openingHours" value={editForm.openingHours} onChange={handleEditFormChange} type="text" placeholder="Opening hours" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <Select name="status" value={editForm.status} onChange={handleEditFormChange}>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpenEditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-border font-bold text-primary hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Updating...' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={openRelationsModal} onClose={() => setOpenRelationsModal(false)} title={selectedRestaurant ? `${selectedRestaurant.name} relations` : 'Restaurant relations'} size="lg">
        {relationLoading ? (
          <p className="text-sm font-medium text-muted-foreground">Loading linked data...</p>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">
              Restaurant #{selectedRestaurant?.id} · {selectedRestaurant?.name}
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-heading font-bold text-primary">{t('manage.linkedOrders') || 'Linked orders'}</h4>
              <DataTable
                headers={['ID', 'Customer', 'Product', 'Status', 'Livreur', 'Total']}
                rows={relationOrders}
                renderRow={(order) => (
                  <tr key={order.id} className="border-t border-border">
                    <td className="py-3 font-bold text-primary">#{order.id}</td>
                    <td className="py-3 text-muted-foreground">{order.customerName}</td>
                    <td className="py-3 text-muted-foreground">{order.productName}</td>
                    <td className="py-3"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{order.status}</span></td>
                    <td className="py-3 text-muted-foreground">{order.assignedLivreurName || '-'}</td>
                    <td className="py-3 text-primary">EUR {Number(order.totalAmount || 0).toFixed(2)}</td>
                  </tr>
                )}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-lg font-heading font-bold text-primary">{t('manage.linkedReclamations') || 'Linked reclamations'}</h4>
              <DataTable
                headers={['ID', 'Client', 'Status', 'Description', 'Date']}
                rows={relationReclamations}
                renderRow={(reclamation) => (
                  <tr key={reclamation.id} className="border-t border-border">
                    <td className="py-3 font-bold text-primary">#{reclamation.id}</td>
                    <td className="py-3 text-muted-foreground">{reclamation.clientId}</td>
                    <td className="py-3"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{reclamation.statut}</span></td>
                    <td className="py-3 text-muted-foreground max-w-[320px] truncate">{reclamation.description}</td>
                    <td className="py-3 text-muted-foreground">{reclamation.dateReclamation ? new Date(reclamation.dateReclamation).toLocaleString() : '-'}</td>
                  </tr>
                )}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
