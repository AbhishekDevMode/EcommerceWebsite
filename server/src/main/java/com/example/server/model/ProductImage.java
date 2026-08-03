package com.example.server.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "product_images")
@Data
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"productImages", "variants", "reviews", "category"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    public ProductImage() {}

    public ProductImage(String imageUrl, String altText, Boolean isPrimary, Integer sortOrder) {
        this.imageUrl = imageUrl;
        this.altText = altText;
        this.isPrimary = isPrimary;
        this.sortOrder = sortOrder;
    }
}
