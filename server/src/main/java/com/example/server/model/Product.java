package com.example.server.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product")
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Transient
    private String title;

    @Column(unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price_cents")
    private Integer basePriceCents;

    private Double price;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "imageurl")
    private String imageUrl;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("product")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductImage> productImages = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("product")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductVariant> variants = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_images_legacy", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    @JsonIgnoreProperties("products")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Category category;

    private String brand;
    private Integer stock = 10;

    private Double averageRating = 0.0;
    private Integer numReviews = 0;

    @ElementCollection
    @CollectionTable(name = "product_sizes", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "size")
    private List<String> sizes = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "product_colors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "color")
    private List<String> colors = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("product")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Review> reviews = new ArrayList<>();

    public String getTitle() {
        return name != null ? name : title;
    }

    public void setTitle(String title) {
        this.name = title;
        this.title = title;
    }

    public String getName() {
        return name != null ? name : title;
    }

    public void setName(String name) {
        this.name = name;
        this.title = name;
    }

    public Integer getBasePriceCents() {
        if (basePriceCents != null) return basePriceCents;
        return price != null ? (int) Math.round(price * 100) : 0;
    }

    public void setBasePriceCents(Integer basePriceCents) {
        this.basePriceCents = basePriceCents;
        if (basePriceCents != null) {
            this.price = basePriceCents / 100.0;
        }
    }

    public Double getPrice() {
        if (price != null) return price;
        return basePriceCents != null ? basePriceCents / 100.0 : 0.0;
    }

    public void setPrice(Double price) {
        this.price = price;
        if (price != null) {
            this.basePriceCents = (int) Math.round(price * 100);
        }
    }

    public String getImageUrl() {
        if (productImages != null && !productImages.isEmpty()) {
            for (ProductImage img : productImages) {
                if (Boolean.TRUE.equals(img.getIsPrimary())) {
                    return img.getImageUrl();
                }
            }
            return productImages.get(0).getImageUrl();
        }
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            return imageUrl;
        }
        if (images != null && !images.isEmpty()) {
            return images.get(0);
        }
        return null;
    }

    public void addImage(ProductImage image) {
        productImages.add(image);
        image.setProduct(this);
    }

    public void addVariant(ProductVariant variant) {
        variants.add(variant);
        variant.setProduct(this);
    }

    public void updateRating() {
        if (reviews == null || reviews.isEmpty()) {
            this.averageRating = 0.0;
            this.numReviews = 0;
        } else {
            double sum = 0.0;
            for (Review r : reviews) {
                sum += (r.getRating() != null ? r.getRating() : 0);
            }
            this.averageRating = Math.round((sum / reviews.size()) * 10.0) / 10.0;
            this.numReviews = reviews.size();
        }
    }
}
