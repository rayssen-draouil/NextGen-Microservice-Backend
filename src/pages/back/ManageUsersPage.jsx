import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { deleteUser, fetchUsers, getStoredSession, registerUser, updateUser } from '@/services/userApi';

const roleOptions = [
  { value: 'client', label: 'Client' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'livreur', label: 'Livreur' },
];

export default function ManageUsersPage() {
  const { t } = useTranslation('admin');
  const session = getStoredSession();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
  });

  const loadUsers = useCallback(async () => {
    if (!session?.accessToken) {
      setRows([]);
      setLoading(false);
      setError('Sign in to load the user list.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const users = await fetchUsers(session.accessToken);
      setRows(
        users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarLabel: user.name?.trim()?.charAt(0)?.toUpperCase() || user.email?.trim()?.charAt(0)?.toUpperCase() || '?',
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().slice(0, 10) : '-',
          status: t('manage.active'),
        })),
      );
    } catch (requestError) {
      setError(requestError.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleEditFormChange = (event) => {
    const { name, value } = event.target;
    setEditForm((current) => ({ ...current, [name]: value }));
  };

  const openCreateUserModal = () => {
    setForm({ name: '', email: '', password: '', role: 'client' });
    setOpenCreateModal(true);
  };

  const openUpdateUserModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'client',
    });
    setOpenEditModal(true);
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await registerUser(form);
      setOpenCreateModal(false);
      setForm({ name: '', email: '', password: '', role: 'client' });
      setSuccessMessage('User created successfully.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to create the user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();

    if (!selectedUser?.id || !session?.accessToken) {
      setError('Unable to edit the selected user.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const payload = {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
      };

      if (editForm.password.trim()) {
        payload.password = editForm.password;
      }

      const updatedUser = await updateUser(selectedUser.id, payload, session.accessToken);
      const normalizedUser = {
        id: updatedUser.id || selectedUser.id,
        name: updatedUser.name || payload.name,
        email: updatedUser.email || payload.email,
        role: updatedUser.role || payload.role,
        avatarLabel: (updatedUser.name || payload.name || updatedUser.email || payload.email || '?').trim().charAt(0).toUpperCase(),
        joinDate: updatedUser.createdAt ? new Date(updatedUser.createdAt).toISOString().slice(0, 10) : '-'
      };

      setRows((currentRows) => currentRows.map((row) => (row.id === normalizedUser.id ? { ...row, ...normalizedUser, status: t('manage.active') } : row)));
      setOpenEditModal(false);
      setSelectedUser(null);
      setEditForm({ name: '', email: '', password: '', role: 'client' });
      setSuccessMessage('User updated successfully.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update the user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!session?.accessToken) {
      setError('Sign in to delete users.');
      return;
    }

    const confirmed = window.confirm(`Delete ${user.name || user.email}? This action cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      await deleteUser(user.id, session.accessToken);
      setRows((currentRows) => currentRows.filter((row) => row.id !== user.id));
      if (selectedUser?.id === user.id) {
        setOpenEditModal(false);
        setSelectedUser(null);
      }
      setSuccessMessage('User deleted successfully.');
      await loadUsers();
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete the user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-heading font-bold text-primary">{t('pages.manageUsers')}</h2>
        <button type="button" onClick={openCreateUserModal} className="px-5 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all">{t('manage.invite')}</button>
      </div>

      {error && <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{error}</div>}
      {successMessage && <div className="rounded-2xl border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary-foreground">{successMessage}</div>}

      <DataTable
        headers={[t('table.customer'), t('table.email'), t('manage.role'), t('table.joinDate'), t('manage.status'), t('table.actions')]}
        rows={rows}
        renderRow={(row) => (
          <tr key={row.id} className="border-t border-border">
            <td className="py-4 text-primary font-medium flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {row.avatarLabel}
              </div>
              <span>{row.name}</span>
            </td>
            <td className="py-4 text-muted-foreground">{row.email}</td>
            <td className="py-4"><span className="px-3 py-1 bg-muted rounded-full text-xs text-primary">{row.role}</span></td>
            <td className="py-4 text-muted-foreground">{row.joinDate}</td>
            <td className="py-4"><span className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-xs">{row.status}</span></td>
            <td className="py-4 flex items-center gap-2">
              <button type="button" onClick={() => openUpdateUserModal(row)} className="px-3 py-1 rounded-lg bg-muted text-primary text-xs font-bold hover:bg-background">{t('manage.edit')}</button>
              <button type="button" onClick={() => handleDeleteUser(row)} className="px-3 py-1 rounded-lg bg-destructive/15 text-destructive text-xs font-bold hover:bg-destructive/20" disabled={isSubmitting}>{t('manage.delete')}</button>
            </td>
          </tr>
        )}
      />

      {loading && <p className="text-sm font-medium text-muted-foreground">Loading users from the Nest service...</p>}

      <Pagination />

      <Modal open={openCreateModal} onClose={() => setOpenCreateModal(false)} title={t('manage.invite')}>
        <form className="space-y-3" onSubmit={handleCreateUser}>
          <input name="name" value={form.name} onChange={handleFormChange} type="text" placeholder="Full name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="email" value={form.email} onChange={handleFormChange} type="email" placeholder="Email" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="password" value={form.password} onChange={handleFormChange} type="password" placeholder="Password" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" minLength={6} required />
          <Select name="role" value={form.role} onChange={handleFormChange}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <button type="submit" disabled={isSubmitting} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">
            {isSubmitting ? 'Creating...' : t('manage.invite')}
          </button>
        </form>
      </Modal>

      <Modal open={openEditModal} onClose={() => setOpenEditModal(false)} title="Edit user" size="sm">
        <form className="space-y-3" onSubmit={handleUpdateUser}>
          <div className="rounded-2xl bg-muted/40 border border-border px-4 py-3 text-sm text-muted-foreground">
            Editing {selectedUser?.name || selectedUser?.email || 'user'}
          </div>
          <input name="name" value={editForm.name} onChange={handleEditFormChange} type="text" placeholder="Full name" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="email" value={editForm.email} onChange={handleEditFormChange} type="email" placeholder="Email" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" required />
          <input name="password" value={editForm.password} onChange={handleEditFormChange} type="password" placeholder="New password (optional)" className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm" minLength={6} />
          <Select name="role" value={editForm.role} onChange={handleEditFormChange}>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onClick={() => setOpenEditModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-border font-bold text-primary hover:bg-muted">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-70">
              {isSubmitting ? 'Updating...' : 'Save changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
