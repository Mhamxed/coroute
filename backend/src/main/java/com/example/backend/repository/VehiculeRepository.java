package com.example.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Vehicule;

import java.sql.Timestamp;
import java.util.List;

@Repository
public class VehiculeRepository {

    private final JdbcTemplate jdbcTemplate;

    public VehiculeRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Vehicule> mapper = (rs, rowNum) -> {
        Vehicule v = new Vehicule();
        v.setPlateNumber(rs.getString("plate_number"));
        v.setModel(rs.getString("model"));
        v.setCapacity(rs.getInt("capacity"));
        v.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return v;
    };

    // CREATE
    public void create(Vehicule v) {
        jdbcTemplate.update("""
            INSERT INTO vehicles (plate_number, model, capacity)
            VALUES (?, ?, ?)
        """,
            v.getPlateNumber(),
            v.getModel(),
            v.getCapacity()
        );
    }

    // FIND BY ID (plate)
    public Vehicule findByPlate(String plate) {
        return jdbcTemplate.queryForObject(
            "SELECT * FROM vehicles WHERE plate_number = ?",
            mapper,
            plate
        );
    }

    // FIND ALL
    public List<Vehicule> findAll() {
        return jdbcTemplate.query(
            "SELECT * FROM vehicles",
            mapper
        );
    }

    // UPDATE
    public int update(Vehicule v) {
        return jdbcTemplate.update("""
            UPDATE vehicles
            SET model = ?, capacity = ?
            WHERE plate_number = ?
        """,
            v.getModel(),
            v.getCapacity(),
            v.getPlateNumber()
        );
    }

    // DELETE
    public int delete(String plate) {
        return jdbcTemplate.update(
            "DELETE FROM vehicles WHERE plate_number = ?",
            plate
        );
    }
}
