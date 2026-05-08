package com.example.backend.repository;

import com.example.backend.model.Booking;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class BookingRepository {

    private final JdbcTemplate jdbc;

    public BookingRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Booking> mapper = (rs, i) -> {
        Booking b = new Booking();
        b.setId(rs.getInt("id"));
        b.setTripId(rs.getInt("trip_id"));
        b.setPassengerId(rs.getInt("passenger_id"));
        b.setSeatsBooked(rs.getInt("seats_booked"));
        b.setStatus(rs.getString("status"));
        try { b.setPaymentIntentId(rs.getString("payment_intent_id")); } catch (Exception ignored) {}
        if (rs.getTimestamp("booked_at") != null)
            b.setBookedAt(rs.getTimestamp("booked_at").toLocalDateTime());
        if (rs.getTimestamp("created_at") != null)
            b.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        try { b.setPassengerFirstName(rs.getString("first_name")); } catch (Exception ignored) {}
        try { b.setPassengerLastName(rs.getString("last_name")); } catch (Exception ignored) {}
        try { b.setPassengerEmail(rs.getString("email")); } catch (Exception ignored) {}
        try { b.setOriginCity(rs.getString("origin_city")); } catch (Exception ignored) {}
        try { b.setDestinationCity(rs.getString("destination_city")); } catch (Exception ignored) {}
        try {
            if (rs.getTimestamp("trip_departure_time") != null)
                b.setTripDepartureTime(rs.getTimestamp("trip_departure_time").toLocalDateTime());
        } catch (Exception ignored) {}
        try { b.setPricePerSeat(rs.getBigDecimal("price_per_seat")); } catch (Exception ignored) {}
        try { b.setTripStatus(rs.getString("trip_status")); } catch (Exception ignored) {}
        return b;
    };

    public int create(Booking b) {
        KeyHolder key = new GeneratedKeyHolder();
        jdbc.update(conn -> {
            PreparedStatement ps = conn.prepareStatement(
                    "INSERT INTO bookings (trip_id, passenger_id, seats_booked, status, payment_intent_id) VALUES (?, ?, ?, 'WAITING', ?)",
                    Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, b.getTripId());
            ps.setInt(2, b.getPassengerId());
            ps.setInt(3, b.getSeatsBooked());
            ps.setString(4, b.getPaymentIntentId());
            return ps;
        }, key);
        return key.getKey().intValue();
    }

    public Booking findById(int id) {
        return jdbc.queryForObject(
                "SELECT b.*, u.first_name, u.last_name, u.email, " +
                        "t.origin_city, t.destination_city, t.departure_time AS trip_departure_time, " +
                        "t.price_per_seat, t.status AS trip_status " +
                        "FROM bookings b " +
                        "JOIN users u ON b.passenger_id = u.id " +
                        "JOIN trips t ON b.trip_id = t.id " +
                        "WHERE b.id = ?",
                mapper, id);
    }

    public List<Booking> findByPassenger(int passengerId) {
        return jdbc.query(
                "SELECT b.*, u.first_name, u.last_name, u.email, " +
                        "t.origin_city, t.destination_city, t.departure_time AS trip_departure_time, " +
                        "t.price_per_seat, t.status AS trip_status " +
                        "FROM bookings b " +
                        "JOIN users u ON b.passenger_id = u.id " +
                        "JOIN trips t ON b.trip_id = t.id " +
                        "WHERE b.passenger_id = ? ORDER BY b.booked_at DESC",
                mapper, passengerId);
    }

    public List<Booking> findByTrip(int tripId) {
        return jdbc.query(
                "SELECT b.*, u.first_name, u.last_name, u.email, " +
                        "t.origin_city, t.destination_city, t.departure_time AS trip_departure_time, " +
                        "t.price_per_seat, t.status AS trip_status " +
                        "FROM bookings b " +
                        "JOIN users u ON b.passenger_id = u.id " +
                        "JOIN trips t ON b.trip_id = t.id " +
                        "WHERE b.trip_id = ? ORDER BY b.booked_at DESC",
                mapper, tripId);
    }

    public void confirm(int id) {
        jdbc.update("UPDATE bookings SET status = 'SCHEDULED' WHERE id = ?", id);
    }

    public void decline(int id) {
        jdbc.update("UPDATE bookings SET status = 'DECLINED' WHERE id = ?", id);
    }

    public void cancel(int id) {
        jdbc.update("DELETE FROM bookings WHERE id = ?", id);
    }

    public boolean existsByPassengerAndTrip(int passengerId, int tripId) {
        Integer count = jdbc.queryForObject(
                "SELECT COUNT(*) FROM bookings WHERE passenger_id = ? AND trip_id = ? AND status != 'DECLINED'",
                Integer.class, passengerId, tripId);
        return count != null && count > 0;
    }
}