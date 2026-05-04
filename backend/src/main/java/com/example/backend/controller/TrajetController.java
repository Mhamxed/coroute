package com.example.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Trajet;
import com.example.backend.service.TrajetService;

@RestController
@RequestMapping("/api/trips")
public class TrajetController {

    private final TrajetService service;

    public TrajetController(TrajetService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Integer> create(@RequestBody Trajet t) {
        return ResponseEntity.ok(service.create(t));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Trajet> get(@PathVariable int id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Trajet>> search(
            @RequestParam String origin,
            @RequestParam String destination) {
        return ResponseEntity.ok(service.search(origin, destination));
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable int id) {
        service.cancel(id);
        return ResponseEntity.noContent().build();
    }
}