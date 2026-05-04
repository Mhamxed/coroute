package com.example.backend.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Vehicule {

    private String plateNumber;
    private String model;
    private Integer capacity;
    private LocalDateTime createdAt;
}
