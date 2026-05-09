package com.example.backend.service;

import com.example.backend.repository.TrajetRepository;
import com.example.backend.model.Trajet;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class PaymentService {

    private final TrajetRepository trajetRepository;

    public PaymentService(
            TrajetRepository trajetRepository,
            @Value("${stripe.secret-key}") String stripeSecretKey) {
        this.trajetRepository = trajetRepository;
        Stripe.apiKey = stripeSecretKey;
    }

    public String createPaymentIntent(int tripId, int seatsBooked, int passengerId) {
        try {
            Trajet trip = trajetRepository.findById(tripId);
            if (trip == null) throw new RuntimeException("Trip not found");
            if (!"SCHEDULED".equals(trip.getStatus())) throw new RuntimeException("Trip is not available");
            if (trip.getAvailableSeats() < seatsBooked) throw new RuntimeException("Not enough seats available");

            BigDecimal total = trip.getPricePerSeat().multiply(BigDecimal.valueOf(seatsBooked));
            long amountInCentimes = total.multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCentimes)
                    .setCurrency("mad")
                    .putMetadata("tripId", String.valueOf(tripId))
                    .putMetadata("passengerId", String.valueOf(passengerId))
                    .putMetadata("seatsBooked", String.valueOf(seatsBooked))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);
            return intent.getClientSecret();

        } catch (Exception e) {
            throw new RuntimeException("Payment intent creation failed: " + e.getMessage());
        }
    }

    public void verifyPayment(String paymentIntentId) {
        try {
            PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);
            if (!"succeeded".equals(intent.getStatus())) {
                throw new RuntimeException("Payment has not been completed");
            }
        } catch (Exception e) {
            throw new RuntimeException("Payment verification failed: " + e.getMessage());
        }
    }

    public Refund refund(String paymentIntentId) {
        try {
            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .build();
            return Refund.create(params);
        } catch (Exception e) {
            throw new RuntimeException("Refund failed: " + e.getMessage());
        }
    }
}