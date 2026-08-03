package com.example.server.service;

import com.example.server.model.Cart;
import com.example.server.model.CartItem;
import com.example.server.model.Product;
import com.example.server.model.User;
import com.example.server.repository.CartItemRepository;
import com.example.server.repository.CartRepository;
import com.example.server.repository.ProductRepository;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Cart getCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    public Cart addToCart(Long userId, Long productId, Integer quantity, String size, String color) {
        Cart cart = getCart(userId);
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId)
                        && Objects.equals(item.getSelectedSize(), size)
                        && Objects.equals(item.getSelectedColor(), color)
                        && !item.isSavedForLater())
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + (quantity != null ? quantity : 1));
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity != null ? quantity : 1);
            newItem.setSelectedSize(size);
            newItem.setSelectedColor(color);
            newItem.setSavedForLater(false);
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }
        return cartRepository.save(cart);
    }

    public Cart updateQuantity(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = getCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (item.getCart().getId().equals(cart.getId())) {
            if (quantity <= 0) {
                cart.getItems().remove(item);
                cartItemRepository.delete(item);
            } else {
                item.setQuantity(quantity);
                cartItemRepository.save(item);
            }
        }
        return cartRepository.save(cart);
    }

    public Cart toggleSaveForLater(Long userId, Long cartItemId, boolean saveForLater) {
        Cart cart = getCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (item.getCart().getId().equals(cart.getId())) {
            item.setSavedForLater(saveForLater);
            cartItemRepository.save(item);
        }
        return cartRepository.save(cart);
    }

    public Cart removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getCart(userId);
        CartItem item = cartItemRepository.findById(cartItemId).orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (item.getCart().getId().equals(cart.getId())) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        }
        return cartRepository.save(cart);
    }

    public void clearCart(Long userId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> !item.isSavedForLater());
        cartRepository.save(cart);
    }
}
