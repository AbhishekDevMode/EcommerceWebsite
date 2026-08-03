package com.example.server.controllers;

import com.example.server.dto.ReviewRequest;
import com.example.server.model.Product;
import com.example.server.model.Review;
import com.example.server.model.User;
import com.example.server.repository.ProductRepository;
import com.example.server.repository.ReviewRepository;
import com.example.server.repository.UserRepository;
import com.example.server.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepository.findByProductIdOrderByCreatedAtDesc(productId));
    }

    @PostMapping("/add/{productId}")
    public ResponseEntity<?> addReview(@PathVariable Long productId, @RequestBody ReviewRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = new Review();
        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());

        reviewRepository.save(review);

        // Recalculate product rating
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
        product.setReviews(reviews);
        product.updateRating();
        productRepository.save(product);

        return ResponseEntity.ok(product);
    }
}
