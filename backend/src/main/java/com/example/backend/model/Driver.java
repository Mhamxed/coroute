package com.example.backend.model;

import lombok.Data;

@Data
public class Driver {
    private Integer id;
    private Boolean isVerified;
    private String licenceNumber;
    private String vehiclePlate;
}