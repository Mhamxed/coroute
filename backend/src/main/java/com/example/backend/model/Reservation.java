package com.example.backend.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Reservation {

private Integer id;
private Integer trajetId;
private Integer passagerId;

private Integer placesReservees;

private String statut; // EN_ATTENTE, CONFIRME, ANNULE

private LocalDateTime bookedAt;
private LocalDateTime updatedAt;


}