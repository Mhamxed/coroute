package com.example.backend.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class PassengerRepository {

    private final JdbcTemplate jdbcTemplate;

    public PassengerRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void create(int userId) {
        jdbcTemplate.update("""
            INSERT INTO passengers (id, is_verified)
            VALUES (?, 0)
        """, userId);
    }
}