package com.example.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class DriverRepository {

    private final JdbcTemplate jdbcTemplate;

    public DriverRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void create(int userId, String licenceNumber, String vehiclePlate) {
        jdbcTemplate.update("""
            INSERT INTO drivers (id, is_verified, licence_number, vehicle_plate)
            VALUES (?, 0, ?, ?)
        """, userId, licenceNumber, vehiclePlate);
    }
}