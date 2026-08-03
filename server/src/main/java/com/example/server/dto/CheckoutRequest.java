package com.example.server.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private String shippingAddress;
    private String paymentMethod = "Stripe";
    private Double subtotal;
    private Double tax;
    private Double shippingFee;
    private Double totalAmount;
}
