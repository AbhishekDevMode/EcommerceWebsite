package com.example.server.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "product_images")
@Data
public class ProductImage {

    @EmbeddedId
    @JsonIgnore
    private ProductImageId id;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @MapsId("productId")
    @JsonIgnoreProperties({"productImages", "variants", "reviews", "category"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    public ProductImage() {}

    public ProductImage(String imageUrl, String altText, Boolean isPrimary, Integer sortOrder) {
        this.id = new ProductImageId(null, imageUrl);
        this.altText = altText;
        this.isPrimary = isPrimary;
        this.sortOrder = sortOrder;
    }

    public String getImageUrl() {
        return id == null ? null : id.getImageUrl();
    }

    public void setImageUrl(String imageUrl) {
        if (id == null) {
            id = new ProductImageId();
        }
        id.setImageUrl(imageUrl);
    }
}
