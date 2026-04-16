import { request } from './apiClient';

const SESSION_STORAGE_KEY = 'foodly_user_session';

export function normalizeRole(role) {
  const value = String(role || '').toLowerCase();

  if (value === 'restaurant_user' || value === 'resto') {
    return 'restaurant';
  }

  if (value === 'administrator') {
    return 'admin';
  }

  return value || 'client';
}

export function getRoleLabel(role) {
  const normalizedRole = normalizeRole(role);

  switch (normalizedRole) {
    case 'admin':
      return 'Admin';
    case 'restaurant':
      return 'Restaurant Manager';
    case 'livreur':
      return 'Livreur';
    default:
      return 'Client';
  }
}

export function getStoredSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession);
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveSession(session) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function loginUser(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function registerUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchUsers(token) {
  return request('/users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function updateUser(id, payload, token) {
  return request(`/users/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id, token) {
  return request(`/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
