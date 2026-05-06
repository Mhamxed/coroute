package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Booking {
    private Integer id;
    private Integer tripId;
    private Integer passengerId;
    private Integer seatsBooked;
    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime bookedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    private String passengerFirstName;
    private String passengerLastName;
    private String passengerEmail;

    private String originCity;
    private String destinationCity;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime tripDepartureTime;

    private BigDecimal pricePerSeat;
    private String tripStatus;
}