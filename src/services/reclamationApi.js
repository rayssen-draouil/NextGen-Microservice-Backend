import { request } from './apiClient';

function toPositiveInteger(value, fallback = 1) {
  const numeric = Number(value);

  if (Number.isFinite(numeric) && numeric > 0) {
    return Math.trunc(numeric);
  }

  const text = String(value || '').trim();

  if (!text) {
    return fallback;
  }

  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }

  return (hash % 900000000) + 1;
}

function toJavaLocalDateTime(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
}

export async function fetchReclamations() {
  try {
    return await request('/reclamations');
  } catch {
    try {
      return await request('/restaurants/reclamations');
    } catch {
      return [];
    }
  }
}

export function fetchReclamation(id) {
  return request(`/reclamations/${id}`);
}

export function createReclamation(payload) {
  const normalizedPayload = {
    ...payload,
    restaurantId: toPositiveInteger(payload?.restaurantId),
    clientId: toPositiveInteger(payload?.clientId),
    dateReclamation: toJavaLocalDateTime(payload?.dateReclamation),
  };

  return request('/reclamations', {
    method: 'POST',
    body: JSON.stringify(normalizedPayload),
  });
}

export function updateReclamation(id, payload) {
  const normalizedPayload = {
    ...payload,
    restaurantId: toPositiveInteger(payload?.restaurantId),
    clientId: toPositiveInteger(payload?.clientId),
    dateReclamation: toJavaLocalDateTime(payload?.dateReclamation),
  };

  return request(`/reclamations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(normalizedPayload),
  });
}

export function deleteReclamation(id) {
  return request(`/reclamations/${id}`, {
    method: 'DELETE',
  });
}
