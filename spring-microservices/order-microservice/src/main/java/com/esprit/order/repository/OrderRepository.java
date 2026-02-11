package com.esprit.order.repository;

import com.esprit.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByCustomerName(String customerName);

    List<Order> findByStatus(String status);
}