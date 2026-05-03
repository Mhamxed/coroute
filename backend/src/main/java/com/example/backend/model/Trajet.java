package com.example.backend.model;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class Trajet {

    private Integer id;
    private Integer driverId;

    private String originCity;
    private String destinationCity;

    private LocalDateTime departureTime;

    private Integer totalSeats;
    private Integer availableSeats;

    private BigDecimal pricePerSeat;

    private String description;
    private String status; // SCHEDULED, CANCELLED, COMPLETED

    private LocalDateTime createdAt;


}
