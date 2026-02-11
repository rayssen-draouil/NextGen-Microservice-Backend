package com.esprit.order.service;

import com.esprit.order.entity.Order;
import com.esprit.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public List<Order> getAll() {
        return repository.findAll();
    }

    public Order getById(Integer id) {
        return repository.findById(id).orElse(null);
    }

    public Order create(Order order) {
        order.setStatus("PENDING");
        return repository.save(order);
    }

    public Order update(Integer id, Order newOrder) {
        return repository.findById(id)
                .map(order -> {
                    order.setCustomerName(newOrder.getCustomerName());
                    order.setProductName(newOrder.getProductName());
                    order.setQuantity(newOrder.getQuantity());
                    order.setPrice(newOrder.getPrice());
                    return repository.save(order);
                })
                .orElse(null);
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }

    // 🔥 Extra functionality
    public Order confirmOrder(Integer id) {
        Order order = getById(id);
        if (order != null) {
            order.setStatus("CONFIRMED");
            return repository.save(order);
        }
        return null;
    }

    public Order cancelOrder(Integer id) {
        Order order = getById(id);
        if (order != null) {
            order.setStatus("CANCELLED");
            return repository.save(order);
        }
        return null;
    }
}