import { request } from './apiClient';

export function fetchOrders() {
  return request('/order');
}

export function fetchOrder(id) {
  return request(`/order/${id}`);
}

export function fetchOrdersByRestaurant(restaurantId) {
  return request(`/order/restaurant/${restaurantId}`);
}

export function fetchOrdersByLivreur(livreurId) {
  return request(`/order/livreur/${livreurId}`);
}

export function createOrder(payload) {
  return request('/order', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateOrder(id, payload) {
  return request(`/order/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteOrder(id) {
  return request(`/order/${id}`, {
    method: 'DELETE',
  });
}

export function confirmOrder(id) {
  return request(`/order/${id}/confirm`, {
    method: 'PUT',
  });
}

export function cancelOrder(id) {
  return request(`/order/${id}/cancel`, {
    method: 'PUT',
  });
}

export function assignDeliveryToOrder(orderId, deliveryId) {
  return request(`/order/${orderId}/assign-delivery/${deliveryId}`, {
    method: 'PUT',
  });
}

export function assignLivreurToOrder(orderId, payload) {
  return request(`/order/${orderId}/assign-livreur`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
