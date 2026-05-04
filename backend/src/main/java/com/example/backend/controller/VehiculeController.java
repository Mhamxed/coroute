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
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.Vehicule;
import com.example.backend.service.VehiculeService;

@RestController
@RequestMapping("/api/vehicles")
public class VehiculeController {

    private final VehiculeService service;

    public VehiculeController(VehiculeService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<Void> create(@RequestBody Vehicule v) {
        service.create(v);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{plate}")
    public ResponseEntity<Vehicule> get(@PathVariable String plate) {
        return ResponseEntity.ok(service.get(plate));
    }

    @GetMapping
    public ResponseEntity<List<Vehicule>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @PutMapping("/{plate}")
    public ResponseEntity<Void> update(@PathVariable String plate, @RequestBody Vehicule v) {
        v.setPlateNumber(plate);
        service.update(v);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{plate}")
    public ResponseEntity<Void> delete(@PathVariable String plate) {
        service.delete(plate);
        return ResponseEntity.noContent().build();
    }
}