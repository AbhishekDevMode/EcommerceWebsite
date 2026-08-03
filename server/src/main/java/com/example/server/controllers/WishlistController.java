package com.example.server.controllers;

import com.example.server.model.Wishlist;
import com.example.server.security.UserDetailsImpl;
import com.example.server.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {
    @Autowired
    private WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<Wishlist> getWishlist(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(wishlistService.getWishlist(userDetails.getId()));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<Wishlist> addProduct(@PathVariable Long productId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(wishlistService.addProduct(userDetails.getId(), productId));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<Wishlist> removeProduct(@PathVariable Long productId, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(wishlistService.removeProduct(userDetails.getId(), productId));
    }
}
