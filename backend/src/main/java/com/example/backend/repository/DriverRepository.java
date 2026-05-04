package com.example.backend.repository;

import com.example.backend.model.Driver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class DriverRepository {

    private final JdbcTemplate jdbcTemplate;

    public DriverRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Driver> mapper = (rs, rowNum) -> {
        Driver d = new Driver();
        d.setId(rs.getInt("id"));
        d.setIsVerified(rs.getBoolean("is_verified"));
        d.setLicenceNumber(rs.getString("licence_number"));
        d.setVehiclePlate(rs.getString("vehicle_plate"));
        return d;
    };

    public void create(int userId, String licenceNumber, String vehiclePlate) {
        jdbcTemplate.update("""
            INSERT INTO drivers (id, is_verified, licence_number, vehicle_plate)
            VALUES (?, 0, ?, ?)
        """, userId, licenceNumber, vehiclePlate);
    }

    public Optional<Driver> findById(int id) {
        var results = jdbcTemplate.query(
                "SELECT * FROM drivers WHERE id = ?",
                mapper,
                id
        );
        return results.stream().findFirst();
    }

    public int update(Driver driver) {
        return jdbcTemplate.update("""
            UPDATE drivers
            SET licence_number = ?, vehicle_plate = ?
            WHERE id = ?
        """,
                driver.getLicenceNumber(),
                driver.getVehiclePlate(),
                driver.getId()
        );
    }

    public int verify(int id) {
        return jdbcTemplate.update("""
            UPDATE drivers
            SET is_verified = 1
            WHERE id = ?
        """, id);
    }
}