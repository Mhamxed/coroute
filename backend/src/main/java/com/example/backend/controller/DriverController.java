package com.example.backend.controller;

import com.example.backend.model.Driver;
import com.example.backend.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

    private final DriverService service;

    public DriverController(DriverService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Driver> getDriver(@PathVariable int id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Driver> updateDriver(
            @PathVariable int id,
            @RequestBody Driver driver) {
        driver.setId(id);
        return ResponseEntity.ok(service.update(driver));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<Void> verify(@PathVariable int id) {
        service.verify(id);
        return ResponseEntity.noContent().build();
    }
}