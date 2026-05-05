package com.example.backend.controller;

import com.example.backend.dto.AdminAuthRequest;
import com.example.backend.dto.AdminStatsResponse;
import com.example.backend.dto.AuthResponse;
import com.example.backend.model.User;
import com.example.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AdminAuthRequest req) {
        return ResponseEntity.ok(adminService.login(req));
    }


    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }


    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getUsers(@RequestParam(required = false) String search) {
        List<User> users = (search != null && !search.isBlank())
                ? adminService.searchUsers(search)
                : adminService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/drivers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getDrivers() {
        return ResponseEntity.ok(adminService.getAllDrivers());
    }

    @PatchMapping("/drivers/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> verifyDriver(@PathVariable int id) {
        adminService.verifyDriver(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/drivers/{id}/unverify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unverifyDriver(@PathVariable int id) {
        adminService.unverifyDriver(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/trips")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTrips() {
        return ResponseEntity.ok(adminService.getAllTrips());
    }

    @PatchMapping("/trips/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelTrip(@PathVariable int id) {
        adminService.cancelTrip(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }
}