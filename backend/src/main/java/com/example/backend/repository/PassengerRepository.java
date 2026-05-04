package com.example.backend.repository;

import com.example.backend.model.Passenger;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PassengerRepository {

    private final JdbcTemplate jdbcTemplate;

    public PassengerRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Passenger> mapper = (rs, rowNum) -> {
        Passenger p = new Passenger();
        p.setId(rs.getInt("id"));
        p.setIsVerified(rs.getBoolean("is_verified"));
        return p;
    };

    public void create(int userId) {
        jdbcTemplate.update("""
            INSERT INTO passengers (id, is_verified)
            VALUES (?, 0)
        """, userId);
    }

    public Optional<Passenger> findById(int id) {
        var results = jdbcTemplate.query(
                "SELECT * FROM passengers WHERE id = ?",
                mapper,
                id
        );
        return results.stream().findFirst();
    }

    public int verify(int id) {
        return jdbcTemplate.update("""
            UPDATE passengers
            SET is_verified = 1
            WHERE id = ?
        """, id);
    }
}