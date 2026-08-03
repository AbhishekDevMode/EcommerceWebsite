package com.example.server.controllers;

import com.example.server.dto.AddToCartRequest;
import com.example.server.model.Cart;
import com.example.server.security.UserDetailsImpl;
import com.example.server.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/cart")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<Cart> getCart(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(cartService.getCart(userDetails.getId()));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestBody AddToCartRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(cartService.addToCart(userDetails.getId(), request.getProductId(), request.getQuantity()));
    }

    @PutMapping("/update/{itemId}")
    public ResponseEntity<Cart> updateQuantity(@PathVariable Long itemId, @RequestBody AddToCartRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(cartService.updateQuantity(userDetails.getId(), itemId, request.getQuantity()));
    }
}
