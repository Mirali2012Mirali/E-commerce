package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Order createOrder(Order order) {

        if (order.getUsername() == null || order.getUsername().isBlank()) {
            throw new RuntimeException("Username is required.");
        }

        if (order.getAddress() == null || order.getAddress().isBlank()) {
            throw new RuntimeException("Address is required.");
        }

        if (order.getTotalPrice() == null) {
            throw new RuntimeException("Total price is required.");
        }

        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}