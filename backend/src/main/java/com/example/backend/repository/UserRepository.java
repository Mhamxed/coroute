package com.example.backend.repository;

import com.example.backend.model.User;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<User> mapper = (rs, rowNum) -> {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setFirstName(rs.getString("first_name"));
        u.setLastName(rs.getString("last_name"));
        u.setPhone(rs.getString("phone"));
        u.setBio(rs.getString("bio"));
        u.setAvatarUrl(rs.getString("avatar_url"));
        u.setRole(rs.getString("role"));
        u.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return u;
    };

    public int create(User user) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                INSERT INTO users (email, password_hash, first_name, last_name, phone, bio, avatar_url, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, user.getEmail());
            ps.setString(2, user.getPasswordHash());
            ps.setString(3, user.getFirstName());
            ps.setString(4, user.getLastName());
            ps.setString(5, user.getPhone());
            ps.setString(6, user.getBio());
            ps.setString(7, user.getAvatarUrl());
            ps.setString(8, user.getRole());
            return ps;
        }, keyHolder);
        return keyHolder.getKey().intValue();
    }

    public Optional<User> findByEmail(String email) {
        var results = jdbcTemplate.query(
                "SELECT * FROM users WHERE email = ?",
                mapper,
                email
        );
        return results.stream().findFirst();
    }

    public Optional<User> findById(int id) {
        var results = jdbcTemplate.query(
                "SELECT * FROM users WHERE id = ?",
                mapper,
                id
        );
        return results.stream().findFirst();
    }
}