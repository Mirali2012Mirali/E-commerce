package com.ecommerce.service;

import com.ecommerce.dto.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.Product;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    public Cart createCart(Cart cart) {

        if (!productRepository.existsById(cart.getProductId())) {
            throw new RuntimeException("Product not found.");
        }

        List<Cart> existing = cartRepository.findByUsername(cart.getUsername());

        for (Cart item : existing) {
            if (item.getProductId().equals(cart.getProductId())) {
                int currentQty = item.getQuantity() == null ? 0 : item.getQuantity();
                int addQty = cart.getQuantity() == null ? 1 : cart.getQuantity();
                item.setQuantity(currentQty + addQty);
                return cartRepository.save(item);
            }
        }

        if (cart.getQuantity() == null || cart.getQuantity() < 1) {
            cart.setQuantity(1);
        }

        return cartRepository.save(cart);
    }

    public List<Cart> getAllCarts() {
        return cartRepository.findAll();
    }

    public List<CartResponse> getUserCart(String username) {

        List<Cart> carts = cartRepository.findByUsername(username);

        List<CartResponse> response = new ArrayList<>();

        for (Cart cart : carts) {

            Product product = productRepository.findById(cart.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found."));

            CartResponse item = new CartResponse();

            item.setCartId(cart.getId());
            item.setProductId(product.getId());
            item.setBrand(product.getBrand());
            item.setModel(product.getModel());
            item.setImageUrl(product.getImageUrl());
            item.setPrice(product.getPrice());
            item.setQuantity(cart.getQuantity());

            response.add(item);
        }

        return response;
    }

    public void deleteCart(Long id) {
        cartRepository.deleteById(id);
    }
}