package com.example.backend.controller;

import com.example.backend.model.Passenger;
import com.example.backend.service.PassengerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/passengers")
public class PassengerController {

    private final PassengerService service;

    public PassengerController(PassengerService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Passenger> getPassenger(@PathVariable int id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<Void> verify(@PathVariable int id) {
        service.verify(id);
        return ResponseEntity.noContent().build();
    }
}