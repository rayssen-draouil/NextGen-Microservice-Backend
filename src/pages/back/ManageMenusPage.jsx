import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { fetchRestaurants } from '@/services/restaurantApi';
import { getStoredSession, normalizeRole } from '@/services/userApi';
import { createMenu, deleteMenu, fetchMenus, fetchMenusByRestaurant, updateMenu } from '@/services/menuApi';

export default function ManageMenusPage() {
  const { t } = useTranslation('admin');
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);
  const sessionEmail = String(session?.user?.email || '').toLowerCase();
  const [rows, setRows] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [form, setForm] = useState({
    nom: '',
    description: '',
    prix: '',
    disponible: true,
    restaurantId: '',
  });
  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    prix: '',
    disponible: true,
    restaurantId: '',
  });

  const normalizeMenusPayload = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.value)) {
      return payload.value;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.content)) {
      return payload.content;
    }

    return [];
  };

  const normalizeRestaurantsPayload = (payload) => {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.value)) {
      return payload.value;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.content)) {
      return payload.content;
    }

    return [];
  };

  const loadMenus = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const restaurantsPayload = await fetchRestaurants();
      const normalizedRestaurants = normalizeRestaurantsPayload(restaurantsPayload);
      setRestaurants(normalizedRestaurants);

      const resolvedRestaurant = role === 'restaurant'
        ? (
          normalizedRestaurants.find((restaurant) => String(restaurant.email || '').toLowerCase() === sessionEmail)
          || normalizedRestaurants.find((restaurant) => String(restaurant.id) === String(session?.user?.restaurantId || ''))
          || (normalizedRestaurants.length === 1 ? normalizedRestaurants[0] : null)
        )
        : null;

      setMyRestaurant(resolvedRestaurant);

      const menusPayload = role === 'restaurant' && resolvedRestaurant?.id
        ? await fetchMenusByRestaurant(resolvedRestaurant.id)
        : await fetchMenus();
      const menus = normalizeMenusPayload(menusPayload);

      const normalizedRows = menus.map((menu) => ({
        id: menu.id,
        nom: menu.nom,
        description: menu.description,
        prix: menu.prix,
        disponible: menu.disponible,
        restaurantId: menu.restaurantId ?? menu.restaurant?.id ?? null,
      }));

      const hasRestaurantBinding = normalizedRows.some(
        (menu) => menu.restaurantId !== null && menu.restaurantId !== undefined && String(menu.restaurantId) !== '',
      );

      if (role === 'restaurant') {
        if (!resolvedRestaurant) {
          if (!hasRestaurantBinding) {
            // Legacy payload with no restaurant binding: keep menus visible instead of showing an empty table.
            setRows(normalizedRows);
          } else {
            setRows([]);
            if (normalizedRows.length > 0) {
              setError('No restaurant is linked to this account yet. Create or link your restaurant first.');
            }
          }
        } else if (!hasRestaurantBinding) {
          // Legacy data: backend menus without restaurantId.
          setRows(normalizedRows);
        } else {
          setRows(
            normalizedRows.filter(
            (menu) => String(menu.restaurantId) === String(resolvedRestaurant.id),
            ),
          );
        }
      } else {
        setRows(normalizedRows);
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to load menus.');
    } finally {
      setLoading(false);
    }
  }, [role, sessionEmail]);

  useEffect(() => {
    void loadMenus();
  }, [loadMenus]);

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleEditFormChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const openCreateMenuModal = () => {
    if (role === 'restaurant' && !myRestaurant) {
      setError('Create your restaurant first before adding menus.');
      return;
    }

    const defaultRestaurantId = role === 'restaurant'
      ? String(myRestaurant?.id || '')
      : String(restaurants[0]?.id || '');

    setForm({ nom: '', description: '', prix: '', disponible: true, restaurantId: defaultRestaurantId });
    setOpenCreateModal(true);
  };

  const openUpdateMenuModal = (menu) => {
    setSelectedMenu(menu);
    setEditForm({
      nom: menu.nom || '',
      description: menu.description || '',
      prix: menu.prix ?? '',
      disponible: Boolean(menu.disponible),
      restaurantId: String(menu.restaurantId || ''),
    });
    setOpenEditModal(true);
  };

  const handleCreateMenu = async (event) => {
    event.preventDefault();

    if (role === 'restaurant' && !myRestaurant) {
      setError('Create your restaurant first before adding menus.');
      return;
    }

    if (role === 'admin' && !form.restaurantId) {
      setError('Select a restaurant before creating a menu.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createMenu({
        nom: form.nom,
        description: form.description,
        prix: Number(form.prix),
        disponible: Boolean(form.disponible),
        restaurantId: role === 'restaurant' ? myRestaurant?.id : Number(form.restaurantId),
      });
      setOpenCreateModal(false);
      setSuccessMessage('Menu created successfully.');
      await loadMenus();
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMenu = async (event) => {
    event.preventDefault();

    if (!selectedMenu?.id) {
      setError('Unable to edit the selected menu.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      if (role === 'admin' && !editForm.restaurantId) {
        setError('Select a restaurant before updating this menu.');
        setIsSubmitting(false);
        return;
      }

      await updateMenu(selectedMenu.id, {
        nom: editForm.nom,
        description: editForm.description,
        prix: Number(editForm.prix),
        disponible: Boolean(editForm.disponible),
        restaurantId: role === 'restaurant' ? myRestaurant?.id : Number(editForm.restaurantId),
      });
      setOpenEditModal(false);
      setSelectedMenu(null);
      setSuccessMessage('Menu updated successfully.');
      await loadMenus();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMenu = async (menu) => {
    const confirmed = window.confirm(`Delete menu #${menu.id}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteMenu(menu.id);
      setRows((currentRows) => currentRows.filter((row) => row.id !== menu.id));
      setSuccessMessage('Menu deleted successfully.');
      await loadMenus();
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-heading font-bold text-primary">{t('pages.manageMenus')}</h2>
        <button type="button" onClick={openCreateMenuModal} className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all">{t('manage.addMenu')}</button>
      </div>

      {role === 'restaurant' && (
        <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          You can manage menus only for your restaurant: {myRestaurant?.name || 'No restaurant linked yet.'}
        </div>
      )}

      {role === 'restaurant' && myRestaurant && rows.length === 0 && (
        <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">
          You must create at least one menu for your restaurant account.
        </div>
      )}

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

      <DataTable
        headers={['ID', 'Name', 'Description', 'Price', 'Available', 'Restaurant ID', 'Actions']}
        rows={rows}
        renderRow={(row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="py-4 font-bold text-primary">#{row.id}</td>
            <td className="py-4 text-muted-foreground">{row.nom}</td>
            <td className="py-4 text-muted-foreground max-w-[320px] truncate">{row.description || '-'}</td>
            <td className="py-4 text-primary">EUR {Number(row.prix || 0).toFixed(2)}</td>
            <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.disponible ? 'Yes' : 'No'}</span></td>
            <td className="py-4 text-muted-foreground">{row.restaurantId || '-'}</td>
            <td className="py-4 flex items-center gap-2">
              <button type="button" onClick={() => openUpdateMenuModal(row)} className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">Edit</button>
              {role === 'admin' && (
                <button type="button" onClick={() => handleDeleteMenu(row)} disabled={isSubmitting} className="px-3 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-bold hover:bg-destructive/20">Delete</button>
              )}
            </td>
          </tr>
        )}
      />

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading menus from the Spring service...</p>}

      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} title={t('manage.addMenu')} size="sm">
        <form className="space-y-3" onSubmit={handleCreateMenu}>
          <input name="nom" value={form.nom} onChange={handleFormChange} type="text" placeholder="Menu name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm min-h-28" />
          <input name="prix" value={form.prix} onChange={handleFormChange} type="number" min="0" step="0.01" placeholder="Price" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          {role === 'restaurant' ? (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Restaurant: <span className="font-semibold text-primary">{myRestaurant?.name || 'Not linked'}</span>
            </div>
          ) : (
            <Select name="restaurantId" value={form.restaurantId} onChange={handleFormChange}>
              <option value="">Select restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
              ))}
            </Select>
          )}
          <label className="flex items-center gap-3 text-sm text-primary font-medium">
            <input name="disponible" checked={form.disponible} onChange={handleFormChange} type="checkbox" className="h-4 w-4" />
            Available
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Creating...' : 'Create menu'}</button>
        </form>
      </Modal>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title="Edit menu" size="sm">
        <form className="space-y-3" onSubmit={handleUpdateMenu}>
          <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">Editing menu #{selectedMenu?.id}</div>
          <input name="nom" value={editForm.nom} onChange={handleEditFormChange} type="text" placeholder="Menu name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <textarea name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm min-h-28" />
          <input name="prix" value={editForm.prix} onChange={handleEditFormChange} type="number" min="0" step="0.01" placeholder="Price" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          {role === 'restaurant' ? (
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              Restaurant: <span className="font-semibold text-primary">{myRestaurant?.name || 'Not linked'}</span>
            </div>
          ) : (
            <Select name="restaurantId" value={editForm.restaurantId} onChange={handleEditFormChange}>
              <option value="">Select restaurant</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
              ))}
            </Select>
          )}
          <label className="flex items-center gap-3 text-sm text-primary font-medium">
            <input name="disponible" checked={editForm.disponible} onChange={handleEditFormChange} type="checkbox" className="h-4 w-4" />
            Available
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpenEditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-border font-bold text-primary hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Updating...' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
