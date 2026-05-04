package com.example.backend.controller;

import org.springframework.web.bind.annotation.*;

import com.example.backend.model.Vehicule;
import com.example.backend.service.VehiculeService;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehiculeController {

    private final VehiculeService service;

    public VehiculeController(VehiculeService service) {
        this.service = service;
    }

    @PostMapping
    public void create(@RequestBody Vehicule v) {
        service.create(v);
    }

    @GetMapping("/{plate}")
    public Vehicule get(@PathVariable String plate) {
        return service.get(plate);
    }

    @GetMapping
    public List<Vehicule> getAll() {
        return service.getAll();
    }

    @PutMapping("/{plate}")
    public void update(@PathVariable String plate, @RequestBody Vehicule v) {
        v.setPlateNumber(plate);
        service.update(v);
    }

    @DeleteMapping("/{plate}")
    public void delete(@PathVariable String plate) {
        service.delete(plate);
    }
}
