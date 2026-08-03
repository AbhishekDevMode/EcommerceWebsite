package com.example.server.repository;

import com.example.server.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {
    Optional<Product> findBySlug(String slug);

    List<Product> findByIsActiveTrue();

    List<Product> findByCategoryId(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.id != :productId AND p.isActive = true")
    List<Product> findRelatedProducts(@Param("categoryId") Long categoryId, @Param("productId") Long productId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.category.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Product> searchAutocomplete(@Param("query") String query, Pageable pageable);
}
