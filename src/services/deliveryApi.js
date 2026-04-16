import { request } from './apiClient';

export function fetchDeliveries() {
  return request('/livraisons');
}

export function fetchDeliveryOrders() {
  return request('/delivery/orders');
}

export function fetchDelivery(id) {
  return request(`/livraisons/${id}`);
}

export function createDelivery(payload) {
  return request('/livraisons', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateDelivery(id, payload) {
  return request(`/livraisons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteDelivery(id) {
  return request(`/livraisons/${id}`, {
    method: 'DELETE',
  });
}
