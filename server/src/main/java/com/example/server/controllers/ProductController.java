package com.example.server.controllers;

import com.example.server.model.Product;
import com.example.server.dto.ProductResponse;
import com.example.server.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> getFilteredProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return ResponseEntity.ok(productService.getFilteredProducts(categoryId, search, minPrice, maxPrice, minRating, sortBy, page, size));
    }

    @GetMapping("/autocomplete")
    public ResponseEntity<List<ProductResponse>> autocomplete(@RequestParam String q) {
        return ResponseEntity.ok(productService.autocomplete(q));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getAllProductsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(productService.getProductByCategory(categoryId));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<ProductResponse>> getRelatedProducts(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        return ResponseEntity.ok(productService.getRelatedProducts(product.getCategory().getId(), id));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product product = productService.getProductById(id);
        product.setName(productDetails.getName());
        product.setSlug(productDetails.getSlug());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setBrand(productDetails.getBrand());
        product.setStock(productDetails.getStock());
        product.setImageUrl(productDetails.getImageUrl());
        if (productDetails.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }
        return ResponseEntity.ok(productService.saveProduct(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }
}
