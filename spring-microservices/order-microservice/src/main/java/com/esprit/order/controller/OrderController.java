package com.esprit.order.controller;


import com.esprit.order.entity.Order;
import com.esprit.order.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    // CRUD

    @GetMapping
    public List<Order> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public Order getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PostMapping
    public Order create(@RequestBody Order order) {
        return service.create(order);
    }

    @PutMapping("/{id}")
    public Order update(@PathVariable Integer id,
                        @RequestBody Order order) {
        return service.update(id, order);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }

    // Extra functionality

    @PutMapping("/{id}/confirm")
    public Order confirm(@PathVariable Integer id) {
        return service.confirmOrder(id);
    }

    @PutMapping("/{id}/cancel")
    public Order cancel(@PathVariable Integer id) {
        return service.cancelOrder(id);
    }
}