package com.example.backend.service;

import com.example.backend.model.Passenger;
import com.example.backend.repository.PassengerRepository;
import org.springframework.stereotype.Service;

@Service
public class PassengerService {

    private final PassengerRepository passengerRepository;

    public PassengerService(PassengerRepository passengerRepository) {
        this.passengerRepository = passengerRepository;
    }

    public Passenger getById(int id) {
        return passengerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));
    }

    public void verify(int id) {
        passengerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));
        passengerRepository.verify(id);
    }
}