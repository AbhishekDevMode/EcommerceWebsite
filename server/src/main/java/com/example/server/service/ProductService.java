package com.example.server.service;

import com.example.server.model.Product;
import com.example.server.dto.ProductResponse;
import com.example.server.repository.ProductRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Join;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsActiveTrue().stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getFilteredProducts(
            Long categoryId,
            String query,
            Double minPrice,
            Double maxPrice,
            Double minRating,
            String brand,
            String color,
            String size,
            String sortBy,
            int page,
            int size
    ) {
        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if ("price_asc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price_desc".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        } else if ("rating".equalsIgnoreCase(sortBy) || "popularity".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "averageRating");
        } else if ("newest".equalsIgnoreCase(sortBy)) {
            sort = Sort.by(Sort.Direction.DESC, "createdAt");
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Product> spec = (root, queryObj, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            queryObj.distinct(true);

            // Always filter active products by default
            predicates.add(cb.equal(root.get("isActive"), true));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (query != null && !query.trim().isEmpty()) {
                String searchPattern = "%" + query.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate brandMatch = cb.like(cb.lower(root.get("brand")), searchPattern);
                Predicate descMatch = cb.like(cb.lower(root.get("description")), searchPattern);
                predicates.add(cb.or(nameMatch, brandMatch, descMatch));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("averageRating"), minRating));
            }

            if (brand != null && !brand.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("brand")), brand.toLowerCase()));
            }

            if (color != null && !color.isBlank()) {
                Join<Product, String> colorJoin = root.join("colors", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(colorJoin), color.toLowerCase()));
            }

            if (size != null && !size.isBlank()) {
                Join<Product, String> sizeJoin = root.join("sizes", JoinType.LEFT);
                predicates.add(cb.equal(cb.lower(sizeJoin), size.toLowerCase()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productRepository.findAll(spec, pageable).map(ProductResponse::from);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> autocomplete(String q) {
        if (q == null || q.trim().isEmpty()) {
            return new ArrayList<>();
        }
        return productRepository.searchAutocomplete(q.trim(), PageRequest.of(0, 6)).stream().map(ProductResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getProductByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId).stream().map(ProductResponse::from).toList();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slugOrId) {
        if (slugOrId == null || slugOrId.trim().isEmpty()) {
            throw new RuntimeException("Slug or ID cannot be empty");
        }
        Product product = productRepository.findBySlug(slugOrId)
                .orElseGet(() -> {
                    try {
                        Long id = Long.parseLong(slugOrId);
                        return getProductById(id);
                    } catch (NumberFormatException e) {
                        throw new RuntimeException("Product not found with slug: " + slugOrId);
                    }
                });
        return ProductResponse.from(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long categoryId, Long productId) {
        return productRepository.findRelatedProducts(categoryId, productId, PageRequest.of(0, 4))
                .stream().map(ProductResponse::from).toList();
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
