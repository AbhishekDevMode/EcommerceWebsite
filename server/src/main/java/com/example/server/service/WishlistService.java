package com.example.server.service;

import com.example.server.model.Product;
import com.example.server.model.User;
import com.example.server.model.Wishlist;
import com.example.server.repository.ProductRepository;
import com.example.server.repository.UserRepository;
import com.example.server.repository.WishlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WishlistService {
    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Wishlist getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow();
            Wishlist newWishlist = new Wishlist();
            newWishlist.setUser(user);
            return wishlistRepository.save(newWishlist);
        });
    }

    public Wishlist addProduct(Long userId, Long productId) {
        Wishlist wishlist = getWishlist(userId);
        Product product = productRepository.findById(productId).orElseThrow();
        wishlist.getProducts().add(product);
        return wishlistRepository.save(wishlist);
    }

    public Wishlist removeProduct(Long userId, Long productId) {
        Wishlist wishlist = getWishlist(userId);
        wishlist.getProducts().removeIf(p -> p.getId().equals(productId));
        return wishlistRepository.save(wishlist);
    }
}
