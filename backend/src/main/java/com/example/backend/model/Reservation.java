package com.example.backend.model;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class Reservation {
private Integer id;
private Integer trajetId;
private Integer passagerId;

private Integer placesReservees;

private String statut; 

private LocalDateTime bookedAt;
private LocalDateTime updatedAt;


}