package com.example.server.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long productId;
    private Integer quantity;
    private String selectedSize;
    private String selectedColor;
}
