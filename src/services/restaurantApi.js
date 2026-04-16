import { request } from './apiClient';

export function fetchRestaurants() {
  return request('/restaurants');
}

export function fetchRestaurant(id) {
  return request(`/restaurants/${id}`);
}

export function fetchRestaurantOrders() {
  return request('/restaurants/orders');
}

export function fetchRestaurantReclamations() {
  return request('/restaurants/reclamations');
}

export function createRestaurant(payload) {
  return request('/restaurants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateRestaurant(id, payload) {
  return request(`/restaurants/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteRestaurant(id) {
  return request(`/restaurants/${id}`, {
    method: 'DELETE',
  });
}
