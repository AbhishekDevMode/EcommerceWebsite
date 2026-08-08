package com.example.server.dto;

import com.example.server.model.Product;

import java.util.ArrayList;
import java.util.List;

/** A serialization-safe product representation for the public catalogue API. */
public record ProductResponse(
        Long id,
        String name,
        String title,
        String slug,
        String description,
        Integer basePriceCents,
        Double price,
        Boolean isActive,
        String imageUrl,
        List<String> images,
        CategorySummary category,
        String brand,
        Integer stock,
        Double averageRating,
        Integer numReviews,
        List<String> sizes,
        List<String> colors
) {
    public static ProductResponse from(Product product) {
        List<String> images = new ArrayList<>();
        product.getProductImages().forEach(image -> images.add(image.getImageUrl()));
        product.getImages().forEach(images::add);

        String primaryImage = product.getImageUrl();
        if (primaryImage != null && !images.contains(primaryImage)) {
            images.add(0, primaryImage);
        }

        CategorySummary category = product.getCategory() == null ? null
                : new CategorySummary(product.getCategory().getId(), product.getCategory().getName());

        return new ProductResponse(
                product.getId(), product.getName(), product.getTitle(), product.getSlug(),
                product.getDescription(), product.getBasePriceCents(), product.getPrice(), product.getIsActive(),
                primaryImage, List.copyOf(images), category, product.getBrand(), product.getStock(),
                product.getAverageRating(), product.getNumReviews(), List.copyOf(product.getSizes()),
                List.copyOf(product.getColors())
        );
    }

    public record CategorySummary(Long id, String name) {
    }
}
