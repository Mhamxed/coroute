package com.example.backend.repository;

import com.example.backend.model.Admin;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class AdminRepository {

    private final JdbcTemplate jdbcTemplate;

    public AdminRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Admin> mapper = (rs, rowNum) -> {
        Admin a = new Admin();
        a.setId(rs.getInt("id"));
        return a;
    };

    public void create(int userId) {
        jdbcTemplate.update("""
            INSERT INTO admins (id) VALUES (?)
        """, userId);
    }

    public Optional<Admin> findById(int id) {
        var results = jdbcTemplate.query(
                "SELECT * FROM admins WHERE id = ?",
                mapper,
                id
        );
        return results.stream().findFirst();
    }

    public List<Admin> findAll() {
        return jdbcTemplate.query(
                "SELECT * FROM admins",
                mapper
        );
    }

    public int delete(int id) {
        return jdbcTemplate.update(
                "DELETE FROM admins WHERE id = ?",
                id
        );
    }
}