package com.example.backend.controller;

import com.example.backend.model.Booking;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    public BookingController(BookingService bookingService, JwtUtil jwtUtil) {
        this.bookingService = bookingService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<Integer> create(@RequestBody Booking b, HttpServletRequest request) {
        int passengerId = extractUserId(request);
        b.setPassengerId(passengerId);
        return ResponseEntity.ok(bookingService.create(b));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> myBookings(HttpServletRequest request) {
        int passengerId = extractUserId(request);
        return ResponseEntity.ok(bookingService.getByPassenger(passengerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> get(@PathVariable int id) {
        return ResponseEntity.ok(bookingService.get(id));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Booking>> getByTrip(@PathVariable int tripId) {
        return ResponseEntity.ok(bookingService.getByTrip(tripId));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<Void> confirm(@PathVariable int id) {
        bookingService.confirm(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/decline")
    public ResponseEntity<Void> decline(@PathVariable int id) {
        bookingService.decline(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable int id) {
        bookingService.cancel(id);
        return ResponseEntity.noContent().build();
    }

    private int extractUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = header.substring(7);
        return jwtUtil.getUserId(token);
    }
}