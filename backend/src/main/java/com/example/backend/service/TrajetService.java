package com.example.backend.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.backend.repository.TrajetRepository;
import com.example.backend.model.Trajet;

@Service
public class TrajetService {

    private final TrajetRepository repo;
    private final BookingService bookingService;

    public TrajetService(TrajetRepository repo, BookingService bookingService) {
        this.repo = repo;
        this.bookingService = bookingService;
    }

    public int create(Trajet t) {
        return repo.create(t);
    }

    public Trajet get(int id) {
        return repo.findById(id);
    }

    public List<Trajet> search(String origin, String destination) {
        return repo.search(origin, destination);
    }

    public List<Trajet> driverTrips(int driverId) {
        return repo.findByDriver(driverId);
    }

    public void update(Trajet t) {
        repo.update(t);
    }

    @Transactional
    public void cancel(int id) {
        bookingService.cancelAllByTripByDriver(id);
        repo.cancel(id);
    }
}