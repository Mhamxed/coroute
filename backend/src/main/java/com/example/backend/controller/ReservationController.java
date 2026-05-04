package com.example.backend.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.model.Reservation;
import com.example.backend.service.ReservationService;

@RestController
@RequestMapping(”/api/reservations”)
public class ReservationController {

private final ReservationService service;

public ReservationController(ReservationService service) {
    this.service = service;
}

@PostMapping
public ResponseEntity<Integer> create(@RequestBody Reservation r) {
    int id = service.create(r);
    return ResponseEntity.ok(id);
}

@GetMapping("/{id}")
public Reservation get(@PathVariable int id) {
    return service.get(id);
}

@GetMapping("/passager/{passagerId}")
public List<Reservation> getByPassager(@PathVariable int passagerId) {
    return service.getByPassager(passagerId);
}

@GetMapping("/trajet/{trajetId}")
public List<Reservation> getByTrajet(@PathVariable int trajetId) {
    return service.getByTrajet(trajetId);
}

@PatchMapping("/{id}/confirmer")
public void confirmer(@PathVariable int id) {
    service.confirmer(id);
}

@PatchMapping("/{id}/refuser")
public void refuser(@PathVariable int id) {
    service.refuser(id);
}

@DeleteMapping("/{id}")
public void annuler(@PathVariable int id) {
    service.annuler(id);
}

}