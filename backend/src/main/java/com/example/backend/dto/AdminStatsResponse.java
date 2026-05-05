package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminStatsResponse {
    private int totalUsers;
    private int totalDrivers;
    private int totalPassengers;
    private int totalTrips;
    private int totalBookings;
    private int pendingBookings;
    private int unverifiedDrivers;
}