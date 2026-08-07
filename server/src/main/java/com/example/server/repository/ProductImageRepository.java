package com.example.server.repository;

import com.example.server.model.ProductImage;
import com.example.server.model.ProductImageId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, ProductImageId> {
    List<ProductImage> findByProductId(Long productId);
}
