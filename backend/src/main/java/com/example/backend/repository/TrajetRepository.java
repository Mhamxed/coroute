package com.example.backend.repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.util.List;
import com.example.backend.model.Trajet;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class TrajetRepository {

    private final JdbcTemplate jdbcTemplate;

    public TrajetRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private RowMapper<Trajet> mapper = (rs, rowNum) -> {
        Trajet t = new Trajet();
        t.setId(rs.getInt("id"));
        t.setDriverId(rs.getInt("driver_id"));
        t.setOriginCity(rs.getString("origin_city"));
        t.setDestinationCity(rs.getString("destination_city"));
        t.setDepartureTime(rs.getTimestamp("departure_time").toLocalDateTime());
        t.setTotalSeats(rs.getInt("total_seats"));
        t.setAvailableSeats(rs.getInt("available_seats"));
        t.setPricePerSeat(rs.getBigDecimal("price_per_seat"));
        t.setDescription(rs.getString("description"));
        t.setStatus(rs.getString("status"));
        t.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return t;
    };

    public int create(Trajet t) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement("""
                INSERT INTO trips
                (driver_id, origin_city, destination_city, departure_time,
                 total_seats, available_seats, price_per_seat, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, t.getDriverId());
            ps.setString(2, t.getOriginCity());
            ps.setString(3, t.getDestinationCity());
            ps.setTimestamp(4, Timestamp.valueOf(t.getDepartureTime()));
            ps.setInt(5, t.getTotalSeats());
            ps.setInt(6, t.getTotalSeats());
            ps.setBigDecimal(7, t.getPricePerSeat());
            ps.setString(8, t.getDescription());
            ps.setString(9, "SCHEDULED");
            return ps;
        }, keyHolder);
        return keyHolder.getKey().intValue();
    }

    public Trajet findById(int id) {
        return jdbcTemplate.queryForObject(
                "SELECT * FROM trips WHERE id = ?",
                mapper, id);
    }

    public List<Trajet> search(String origin, String destination) {
        return jdbcTemplate.query("""
            SELECT * FROM trips
            WHERE origin_city = ?
              AND destination_city = ?
              AND status = 'SCHEDULED'
              AND departure_time > SYSDATETIME()
        """, mapper, origin, destination);
    }

    public List<Trajet> findByDriver(int driverId) {
        return jdbcTemplate.query(
                "SELECT * FROM trips WHERE driver_id = ? ORDER BY created_at DESC",
                mapper, driverId);
    }

    public int update(Trajet t) {
        return jdbcTemplate.update("""
            UPDATE trips
            SET origin_city = ?, destination_city = ?, departure_time = ?,
                total_seats = ?, price_per_seat = ?, description = ?
            WHERE id = ?
        """,
                t.getOriginCity(),
                t.getDestinationCity(),
                Timestamp.valueOf(t.getDepartureTime()),
                t.getTotalSeats(),
                t.getPricePerSeat(),
                t.getDescription(),
                t.getId());
    }

    public int cancel(int tripId) {
        return jdbcTemplate.update(
                "UPDATE trips SET status = 'CANCELLED' WHERE id = ?", tripId);
    }

    public void decreaseSeats(int tripId, int seats) {
        jdbcTemplate.update(
                "UPDATE trips SET available_seats = available_seats - ? WHERE id = ?",
                seats, tripId);
    }

    public void increaseSeats(int tripId, int seats) {
        jdbcTemplate.update(
                "UPDATE trips SET available_seats = available_seats + ? WHERE id = ?",
                seats, tripId);
    }
    public int completePassedTrips() {
        return jdbcTemplate.update("""
            UPDATE trips
            SET status = 'COMPLETED'
            WHERE status = 'SCHEDULED'
            AND departure_time < DATEADD(HOUR, 1, SYSDATETIME())
        """);
    }
}