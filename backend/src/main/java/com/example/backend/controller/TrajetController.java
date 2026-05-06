package com.example.backend.controller;

import java.util.List;
import com.example.backend.model.Booking;
import com.example.backend.model.Trajet;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.BookingService;
import com.example.backend.service.TrajetService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips")
public class TrajetController {

    private final TrajetService service;
    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    public TrajetController(TrajetService service, BookingService bookingService, JwtUtil jwtUtil) {
        this.service = service;
        this.bookingService = bookingService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping
    public ResponseEntity<Integer> create(@RequestBody Trajet t, HttpServletRequest request) {
        int driverId = extractUserId(request);
        t.setDriverId(driverId);
        return ResponseEntity.ok(service.create(t));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trajet> get(@PathVariable int id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/{id}/bookings")
    public ResponseEntity<List<Booking>> getTripBookings(@PathVariable int id) {
        return ResponseEntity.ok(bookingService.getByTrip(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Trajet>> myTrips(HttpServletRequest request) {
        int driverId = extractUserId(request);
        return ResponseEntity.ok(service.driverTrips(driverId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Trajet>> search(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination) {
        String o = origin != null ? origin : from;
        String d = destination != null ? destination : to;
        return ResponseEntity.ok(service.search(o, d));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Trajet>> driverTrips(@PathVariable int driverId) {
        return ResponseEntity.ok(service.driverTrips(driverId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable int id, @RequestBody Trajet t) {
        t.setId(id);
        service.update(t);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable int id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable int id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }

    private int extractUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = header.substring(7);
        return jwtUtil.getUserId(token);
    }
}