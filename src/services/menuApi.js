import { request } from './apiClient';
import { getStoredSession } from './userApi';

function authHeaders() {
  const session = getStoredSession();
  const token = session?.accessToken || session?.access_token;

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function fetchMenus() {
  const headers = authHeaders();

  if (!Object.keys(headers).length) {
    return request('/menus');
  }

  return request('/menus', {
    headers,
  }).catch(() => request('/menus'));
}

export async function fetchMenusByRestaurant(restaurantId) {
  try {
    const scopedMenus = await request(`/menus/restaurant/${restaurantId}`, {
      headers: authHeaders(),
    });

    if (Array.isArray(scopedMenus) && scopedMenus.length > 0) {
      return scopedMenus;
    }
  } catch {
    // Fallback to global menus for older backend versions.
  }

  const allMenus = await fetchMenus();

  if (!Array.isArray(allMenus)) {
    return [];
  }

  const hasRestaurantBinding = allMenus.some(
    (menu) => menu && Object.prototype.hasOwnProperty.call(menu, 'restaurantId'),
  );

  if (!hasRestaurantBinding) {
    // Legacy backend payloads may not expose restaurantId yet.
    return allMenus;
  }

  const filtered = allMenus.filter(
    (menu) => String(menu.restaurantId || '') === String(restaurantId),
  );

  return filtered;
}

export function fetchMenu(id) {
  const headers = authHeaders();

  if (!Object.keys(headers).length) {
    return request(`/menus/${id}`);
  }

  return request(`/menus/${id}`, {
    headers,
  }).catch(() => request(`/menus/${id}`));
}

export function createMenu(payload) {
  return request('/menus', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function updateMenu(id, payload) {
  return request(`/menus/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export function deleteMenu(id) {
  return request(`/menus/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}
