package com.example.server.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "product_variants")
@Data
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(name = "price_cents", nullable = false)
    private Integer priceCents;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "attributes_json", columnDefinition = "TEXT")
    private String attributesJson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    @JsonIgnoreProperties({"productImages", "variants", "reviews", "category"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Product product;

    public ProductVariant() {}

    public ProductVariant(String sku, Integer priceCents, Integer stockQuantity, String attributesJson) {
        this.sku = sku;
        this.priceCents = priceCents;
        this.stockQuantity = stockQuantity;
        this.attributesJson = attributesJson;
    }
}
