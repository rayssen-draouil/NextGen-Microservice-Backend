import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { fetchRestaurants } from '@/services/restaurantApi';
import { getStoredSession, normalizeRole } from '@/services/userApi';
import { createReclamation, deleteReclamation, fetchReclamations, updateReclamation } from '@/services/reclamationApi';

const emptyForm = {
  restaurantId: '',
  clientId: '',
  description: '',
  statut: 'OPEN',
  dateReclamation: '',
};

export default function ManageReclamationsPage() {
  const { t } = useTranslation('admin');
  const session = getStoredSession();
  const role = normalizeRole(session?.user?.role);
  const sessionEmail = String(session?.user?.email || '').toLowerCase();
  const [rows, setRows] = useState([]);
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const loadReclamations = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const [reclamations, restaurants] = await Promise.all([
        fetchReclamations(),
        fetchRestaurants(),
      ]);

      const normalizedReclamations = reclamations.map((reclamation) => ({
        id: reclamation.id,
        restaurantId: reclamation.restaurantId,
        clientId: reclamation.clientId,
        description: reclamation.description,
        statut: reclamation.statut,
        dateReclamation: reclamation.dateReclamation ? new Date(reclamation.dateReclamation).toLocaleString() : '-',
      }));

      const resolvedRestaurant = role === 'restaurant'
        ? restaurants.find((restaurant) => String(restaurant.email || '').toLowerCase() === sessionEmail) || null
        : null;

      setMyRestaurant(resolvedRestaurant);

      if (role === 'restaurant') {
        if (!resolvedRestaurant) {
          setRows([]);
        } else {
          setRows(
            normalizedReclamations.filter(
              (reclamation) => String(reclamation.restaurantId) === String(resolvedRestaurant.id),
            ),
          );
        }
      } else {
        setRows(normalizedReclamations);
      }
    } catch (requestError) {
      setError(requestError.message || 'Unable to load reclamations.');
    } finally {
      setLoading(false);
    }
  }, [role, sessionEmail]);

  useEffect(() => {
    void loadReclamations();
  }, [loadReclamations]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const openCreateReclamationModal = () => {
    setForm({ ...emptyForm, dateReclamation: new Date().toISOString().slice(0, 16) });
    setOpenCreateModal(true);
  };

  const openUpdateReclamationModal = (reclamation) => {
    setSelectedReclamation(reclamation);
    setEditForm({
      restaurantId: reclamation.restaurantId?.toString() || '',
      clientId: reclamation.clientId?.toString() || '',
      description: reclamation.description || '',
      statut: reclamation.statut || 'OPEN',
      dateReclamation: reclamation.dateReclamation ? new Date(reclamation.dateReclamation).toISOString().slice(0, 16) : '',
    });
    setOpenEditModal(true);
  };

  const handleCreateReclamation = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await createReclamation({
        restaurantId: Number(form.restaurantId),
        clientId: Number(form.clientId),
        description: form.description,
        statut: form.statut,
        dateReclamation: form.dateReclamation ? new Date(form.dateReclamation).toISOString() : new Date().toISOString(),
      });
      setOpenCreateModal(false);
      setForm(emptyForm);
      setSuccessMessage('Reclamation created successfully.');
      await loadReclamations();
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the reclamation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReclamation = async (event) => {
    event.preventDefault();

    if (!selectedReclamation?.id) {
      setError('Unable to edit the selected reclamation.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateReclamation(selectedReclamation.id, {
        restaurantId: Number(editForm.restaurantId),
        clientId: Number(editForm.clientId),
        description: editForm.description,
        statut: editForm.statut,
        dateReclamation: editForm.dateReclamation ? new Date(editForm.dateReclamation).toISOString() : new Date().toISOString(),
      });
      setOpenEditModal(false);
      setSelectedReclamation(null);
      setSuccessMessage('Reclamation updated successfully.');
      await loadReclamations();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the reclamation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReclamation = async (reclamation) => {
    const confirmed = window.confirm(`Delete reclamation #${reclamation.id}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteReclamation(reclamation.id);
      setRows((currentRows) => currentRows.filter((row) => row.id !== reclamation.id));
      setSuccessMessage('Reclamation deleted successfully.');
      await loadReclamations();
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the reclamation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-heading font-bold text-primary">Reclamations</h2>
        {role === 'admin' && (
          <button type="button" onClick={openCreateReclamationModal} className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all">Add reclamation</button>
        )}
      </div>

      {role === 'restaurant' && (
        <div className="rounded-2xl border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
          You can view only reclamations linked to your restaurant: {myRestaurant?.name || 'No restaurant linked yet.'}
        </div>
      )}

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

      <DataTable
        headers={['ID', 'Restaurant', 'Client', 'Status', 'Date', 'Description', 'Actions']}
        rows={rows}
        renderRow={(row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="py-4 font-bold text-primary">#{row.id}</td>
            <td className="py-4 text-muted-foreground">{row.restaurantId}</td>
            <td className="py-4 text-muted-foreground">{row.clientId}</td>
            <td className="py-4"><span className="px-3 py-1 rounded-full text-xs bg-secondary/20 text-secondary-foreground">{row.statut}</span></td>
            <td className="py-4 text-muted-foreground">{row.dateReclamation}</td>
            <td className="py-4 text-muted-foreground max-w-[320px] truncate">{row.description}</td>
            <td className="py-4 flex items-center gap-2">
              <button type="button" onClick={() => openUpdateReclamationModal(row)} className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">Edit</button>
              {role === 'admin' && (
                <button type="button" onClick={() => handleDeleteReclamation(row)} disabled={isSubmitting} className="px-3 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-bold hover:bg-destructive/20">Delete</button>
              )}
            </td>
          </tr>
        )}
      />

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading reclamations from the Spring service...</p>}

      {role === 'admin' && (
        <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} title="Add reclamation" size="sm">
          <form className="space-y-3" onSubmit={handleCreateReclamation}>
            <input name="restaurantId" value={form.restaurantId} onChange={handleFormChange} type="number" placeholder="Restaurant ID" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
            <input name="clientId" value={form.clientId} onChange={handleFormChange} type="number" placeholder="Client ID" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
            <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm min-h-28" required />
            <Select name="statut" value={form.statut} onChange={handleFormChange}>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </Select>
            <input name="dateReclamation" value={form.dateReclamation} onChange={handleFormChange} type="datetime-local" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
            <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Creating...' : 'Create reclamation'}</button>
          </form>
        </Modal>
      )}

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title="Edit reclamation" size="sm">
        <form className="space-y-3" onSubmit={handleUpdateReclamation}>
          <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">Editing reclamation #{selectedReclamation?.id}</div>
          <input name="restaurantId" value={editForm.restaurantId} onChange={handleEditFormChange} type="number" placeholder="Restaurant ID" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="clientId" value={editForm.clientId} onChange={handleEditFormChange} type="number" placeholder="Client ID" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <textarea name="description" value={editForm.description} onChange={handleEditFormChange} placeholder="Description" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm min-h-28" required />
          <Select name="statut" value={editForm.statut} onChange={handleEditFormChange}>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
          </Select>
          <input name="dateReclamation" value={editForm.dateReclamation} onChange={handleEditFormChange} type="datetime-local" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setOpenEditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-border font-bold text-primary hover:bg-muted">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">{isSubmitting ? 'Updating...' : 'Save changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
