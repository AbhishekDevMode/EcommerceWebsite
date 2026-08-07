package com.example.server.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

/**
 * Matches the legacy TiDB product_images table, which identifies an image by
 * its product and URL instead of a generated surrogate id.
 */
@Embeddable
@Data
public class ProductImageId implements Serializable {

    @Column(name = "product_id")
    private Long productId;

    @Column(name = "image_url")
    private String imageUrl;

    public ProductImageId() {
    }

    public ProductImageId(Long productId, String imageUrl) {
        this.productId = productId;
        this.imageUrl = imageUrl;
    }
}
