package com.example.server.service;

import com.example.server.dto.CheckoutRequest;
import com.example.server.model.*;
import com.example.server.repository.CartRepository;
import com.example.server.repository.OrderRepository;
import com.example.server.repository.ProductRepository;
import com.example.server.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    public Order placeOrder(Long userId, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(userId).orElseThrow(() -> new RuntimeException("Cart not found"));
        
        List<CartItem> activeItems = cart.getItems().stream()
                .filter(item -> !item.isSavedForLater())
                .toList();

        if (activeItems.isEmpty()) {
            throw new RuntimeException("Cart has no active items for checkout");
        }

        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        Order order = new Order();
        order.setUser(user);
        order.setShippingAddress(request.getShippingAddress());
        order.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "Stripe");
        order.setPaymentStatus("PAID");
        order.setStatus("CONFIRMED");

        double subtotal = 0.0;
        for (CartItem cartItem : activeItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            orderItem.setSelectedSize(cartItem.getSelectedSize());
            orderItem.setSelectedColor(cartItem.getSelectedColor());
            order.getItems().add(orderItem);

            subtotal += (cartItem.getProduct().getPrice() * cartItem.getQuantity());

            // Reduce stock
            Product prod = cartItem.getProduct();
            if (prod.getStock() != null && prod.getStock() >= cartItem.getQuantity()) {
                prod.setStock(prod.getStock() - cartItem.getQuantity());
                productRepository.save(prod);
            }
        }

        double tax = Math.round((subtotal * 0.08) * 100.0) / 100.0;
        double shipping = subtotal > 50.0 || subtotal == 0.0 ? 0.0 : 9.99;

        order.setSubtotal(Math.round(subtotal * 100.0) / 100.0);
        order.setTax(tax);
        order.setShippingFee(shipping);
        order.setTotalAmount(Math.round((subtotal + tax + shipping) * 100.0) / 100.0);

        Order savedOrder = orderRepository.save(order);

        // Remove active items from cart, keep saved for later items
        cart.getItems().removeIf(item -> !item.isSavedForLater());
        cartRepository.save(cart);

        return savedOrder;
    }

    public List<Order> getOrderHistory(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    }
}
