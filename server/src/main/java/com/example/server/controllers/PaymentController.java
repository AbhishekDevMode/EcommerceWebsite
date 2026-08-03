package com.example.server.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PaymentController {

    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> paymentData) {
        String method = (String) paymentData.getOrDefault("method", "Stripe");
        Object amount = paymentData.getOrDefault("amount", 0.0);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("transactionId", "TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        response.put("gateway", method);
        response.put("amount", amount);
        response.put("message", "Payment processed successfully via " + method);

        return ResponseEntity.ok(response);
    }
}
