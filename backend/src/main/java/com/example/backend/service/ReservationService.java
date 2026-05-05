package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.backend.model.Reservation;

@Service
public class ReservationService {

public int create(Reservation r) {
    return 0;
}

public Reservation get(int id) {
    return null;
}

public List<Reservation> getByPassager(int passagerId) {
    return null;
}

public List<Reservation> getByTrajet(int trajetId) {
    return null;
}

public void confirmer(int id) {
}

public void refuser(int id) {
}

public void annuler(int id) {
}


}