package com.ecommerce.service;

import com.ecommerce.entity.Order;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    public OrderService(OrderRepository orderRepository, CartRepository cartRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public List<Order> getOrdersByUsername(String username) {
        return orderRepository.findByUsername(username);
    }

    @Transactional
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

        Order saved = orderRepository.save(order);
        cartRepository.deleteByUsername(order.getUsername());
        return saved;
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }
}
