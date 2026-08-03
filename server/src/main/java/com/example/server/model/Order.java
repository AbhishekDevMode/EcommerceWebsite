package com.example.server.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"addresses", "password"})
    private User user;

    private String status = "PLACED";
    
    private Double subtotal = 0.0;
    private Double tax = 0.0;
    private Double shippingFee = 0.0;
    private Double totalAmount = 0.0;

    private String paymentMethod; // Stripe, PayPal, Razorpay
    private String paymentStatus = "PAID";

    @Column(columnDefinition = "TEXT")
    private String shippingAddress;

    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties("order")
    private List<OrderItem> items = new ArrayList<>();
}
