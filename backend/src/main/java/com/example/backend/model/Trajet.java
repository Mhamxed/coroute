package com.example.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class Trajet {
    private Integer id;
    private Integer driverId;
    private String originCity;
    private String destinationCity;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime departureTime;

    private Integer totalSeats;
    private Integer availableSeats;
    private BigDecimal pricePerSeat;
    private String description;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}