package com.example.backend.service;
import org.springframework.stereotype.Service;

import com.example.backend.model.Vehicule;
import com.example.backend.repository.VehiculeRepository;

import java.util.List;

@Service
public class VehiculeService {

    private final VehiculeRepository repo;

    public VehiculeService(VehiculeRepository repo) {
        this.repo = repo;
    }

    public void create(Vehicule v) {
        repo.create(v);
    }

    public Vehicule get(String plate) {
        return repo.findByPlate(plate);
    }

    public List<Vehicule> getAll() {
        return repo.findAll();
    }

    public void update(Vehicule v) {
        repo.update(v);
    }

    public void delete(String plate) {
        repo.delete(plate);
    }
}

