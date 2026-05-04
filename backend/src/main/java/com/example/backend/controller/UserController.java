package com.example.backend.controller;

import com.example.backend.dto.ChangePasswordRequest;
import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getPublicProfile(@PathVariable int id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody User updatedUser) {
        int userId = service.extractIdFromToken(authHeader);
        return ResponseEntity.ok(service.update(userId, updatedUser));
    }

    @PatchMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChangePasswordRequest req) {
        int userId = service.extractIdFromToken(authHeader);
        service.changePassword(userId, req.getOldPassword(), req.getNewPassword());
        return ResponseEntity.noContent().build();
    }
}