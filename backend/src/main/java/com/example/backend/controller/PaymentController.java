package com.example.backend.controller;

import com.example.backend.service.PaymentService;
import com.example.backend.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final JwtUtil jwtUtil;

    @Value("${stripe.publishable-key}")
    private String publishableKey;

    public PaymentController(PaymentService paymentService, JwtUtil jwtUtil) {
        this.paymentService = paymentService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createIntent(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        int tripId = Integer.parseInt(body.get("tripId").toString());
        int seatsBooked = Integer.parseInt(body.get("seatsBooked").toString());

        String header = request.getHeader("Authorization");
        String token = header.substring(7);
        int passengerId = jwtUtil.getUserId(token);

        String clientSecret = paymentService.createPaymentIntent(tripId, seatsBooked, passengerId);

        return ResponseEntity.ok(Map.of(
                "clientSecret", clientSecret,
                "publishableKey", publishableKey
        ));
    }
}