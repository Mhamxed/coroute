package com.example.backend.service;

import com.example.backend.model.Booking;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.TrajetRepository;
import com.stripe.model.Refund;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TrajetRepository trajetRepository;
    private final PaymentService paymentService;

    public BookingService(BookingRepository bookingRepository, TrajetRepository trajetRepository, PaymentService paymentService) {
        this.bookingRepository = bookingRepository;
        this.trajetRepository = trajetRepository;
        this.paymentService = paymentService;
    }

    @Transactional
    public int create(Booking b) {
        if (bookingRepository.existsByPassengerAndTrip(b.getPassengerId(), b.getTripId())) {
            throw new RuntimeException("You already have a booking for this trip");
        }
        var trip = trajetRepository.findById(b.getTripId());
        if (trip == null) throw new RuntimeException("Trip not found");
        if (!"SCHEDULED".equals(trip.getStatus())) throw new RuntimeException("Trip is not available");
        if (trip.getAvailableSeats() < b.getSeatsBooked()) throw new RuntimeException("Not enough seats available");

        if (b.getPaymentIntentId() == null || b.getPaymentIntentId().isBlank()) {
            throw new RuntimeException("Payment required before booking");
        }
        paymentService.verifyPayment(b.getPaymentIntentId());

        return bookingRepository.create(b);
    }

    public Booking get(int id) {
        return bookingRepository.findById(id);
    }

    public List<Booking> getByPassenger(int passengerId) {
        return bookingRepository.findByPassenger(passengerId);
    }

    public List<Booking> getByTrip(int tripId) {
        return bookingRepository.findByTrip(tripId);
    }

    @Transactional
    public void confirm(int id) {
        Booking b = bookingRepository.findById(id);
        var trip = trajetRepository.findById(b.getTripId());
        if (trip.getAvailableSeats() < b.getSeatsBooked()) {
            throw new RuntimeException("Not enough seats left");
        }
        bookingRepository.confirm(id);
        trajetRepository.decreaseSeats(b.getTripId(), b.getSeatsBooked());
    }

    @Transactional
    public void decline(int id) {
        bookingRepository.decline(id);
    }

    @Transactional
    public void cancelByPassenger(int id) {
        Booking b = bookingRepository.findById(id);
        if ("SCHEDULED".equals(b.getStatus())) {
            trajetRepository.increaseSeats(b.getTripId(), b.getSeatsBooked());
        }
        String refundId = null;
        String refundStatus = "NONE";
        if (b.getPaymentIntentId() != null && !b.getPaymentIntentId().isBlank()) {
            try {
                Refund refund = paymentService.refund(b.getPaymentIntentId());
                refundId = refund.getId();
                refundStatus = "succeeded".equals(refund.getStatus()) ? "REFUNDED" : "PENDING";
            } catch (Exception e) {
                refundStatus = "FAILED";
            }
        }
        bookingRepository.cancel(id, refundId, refundStatus);
    }

    @Transactional
    public void cancelAllByTripByDriver(int tripId) {
        List<Booking> active = bookingRepository.findActiveByTrip(tripId);
        for (Booking b : active) {
            if ("SCHEDULED".equals(b.getStatus())) {
                trajetRepository.increaseSeats(tripId, b.getSeatsBooked());
            }
            String refundId = null;
            String refundStatus = "NONE";
            if (b.getPaymentIntentId() != null && !b.getPaymentIntentId().isBlank()) {
                try {
                    Refund refund = paymentService.refund(b.getPaymentIntentId());
                    refundId = refund.getId();
                    refundStatus = "succeeded".equals(refund.getStatus()) ? "REFUNDED" : "PENDING";
                } catch (Exception e) {
                    refundStatus = "FAILED";
                }
            }
            bookingRepository.cancelByDriver(b.getId(), refundId, refundStatus);
        }
    }
}