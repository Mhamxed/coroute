package com.example.backend.service;

import com.example.backend.model.Driver;
import com.example.backend.repository.DriverRepository;
import org.springframework.stereotype.Service;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    public Driver getById(int id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    public Driver update(Driver driver) {
        driverRepository.findById(driver.getId())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driverRepository.update(driver);
        return driver;
    }

    public void verify(int id) {
        driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driverRepository.verify(id);
    }
}