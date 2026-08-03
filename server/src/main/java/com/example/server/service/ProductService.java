package com.example.server.service;
import com.example.server.model.Product;
import com.example.server.repository.ProductRepository;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    public List<Product> getProductByCategory(Long categoryId){
        return productRepository.findByCategoryId(categoryId);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getRelatedProducts(Long categoryId, Long productId) {
        List<Product> products = productRepository.findByCategoryId(categoryId);
        products.removeIf(p -> p.getId().equals(productId));
        return products.size() > 4 ? products.subList(0, 4) : products;
    }

}
