package com.ecommerce.service;

import com.ecommerce.entity.Cart;
import com.ecommerce.repository.CartRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public Cart createCart(Cart cart) {
        return cartRepository.save(cart);
    }

    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    public List<Cart> getUserCart(String username) {
        return cartRepository.findByUsername(username);
    }

    public void deleteCart(Long id) {
        cartRepository.deleteById(id);
    }
}