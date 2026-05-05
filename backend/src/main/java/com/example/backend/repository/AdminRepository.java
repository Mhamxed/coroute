package com.example.backend.repository;

import com.example.backend.model.User;
import com.example.backend.model.Driver;
import com.example.backend.model.Passenger;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class AdminRepository {

    private final JdbcTemplate jdbc;

    public AdminRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }


    public void create(int userId) {
        jdbc.update("INSERT INTO admins (id) VALUES (?)", userId);
    }


    public int countUsers()            { return jdbc.queryForObject("SELECT COUNT(*) FROM users", Integer.class); }
    public int countDrivers()          { return jdbc.queryForObject("SELECT COUNT(*) FROM drivers", Integer.class); }
    public int countPassengers()       { return jdbc.queryForObject("SELECT COUNT(*) FROM passengers", Integer.class); }
    public int countTrips()            { return jdbc.queryForObject("SELECT COUNT(*) FROM trips", Integer.class); }
    public int countBookings()         { return jdbc.queryForObject("SELECT COUNT(*) FROM bookings", Integer.class); }
    public int countPendingBookings()  { return jdbc.queryForObject("SELECT COUNT(*) FROM bookings WHERE status = 'WAITING'", Integer.class); }
    public int countUnverifiedDrivers(){ return jdbc.queryForObject("SELECT COUNT(*) FROM drivers WHERE is_verified = 0", Integer.class); }


    private final RowMapper<User> userMapper = (rs, i) -> {
        User u = new User();
        u.setId(rs.getInt("id"));
        u.setEmail(rs.getString("email"));
        u.setFirstName(rs.getString("first_name"));
        u.setLastName(rs.getString("last_name"));
        u.setPhone(rs.getString("phone"));
        u.setRole(rs.getString("role"));
        u.setCreatedAt(rs.getTimestamp("created_at") != null
                ? rs.getTimestamp("created_at").toLocalDateTime() : null);
        return u;
    };

    public List<User> findAllUsers() {
        return jdbc.query(
                "SELECT id, email, first_name, last_name, phone, role, created_at FROM users ORDER BY created_at DESC",
                userMapper);
    }

    public List<User> searchUsers(String query) {
        String q = "%" + query.toLowerCase() + "%";
        return jdbc.query(
                "SELECT id, email, first_name, last_name, phone, role, created_at FROM users " +
                        "WHERE LOWER(email) LIKE ? OR LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? ORDER BY created_at DESC",
                userMapper, q, q, q);
    }

    public void deleteUser(int userId) {
        jdbc.update("DELETE FROM users WHERE id = ?", userId);
    }


    public List<Map<String, Object>> findAllDrivers() {
        return jdbc.queryForList(
                "SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at, " +
                        "d.is_verified, d.licence_number, d.vehicle_plate " +
                        "FROM users u JOIN drivers d ON u.id = d.id ORDER BY u.created_at DESC");
    }

    public void verifyDriver(int driverId) {
        jdbc.update("UPDATE drivers SET is_verified = 1 WHERE id = ?", driverId);
    }

    public void unverifyDriver(int driverId) {
        jdbc.update("UPDATE drivers SET is_verified = 0 WHERE id = ?", driverId);
    }


    public List<Map<String, Object>> findAllTrips() {
        return jdbc.queryForList(
                "SELECT t.id, t.origin_city, t.destination_city, t.departure_time, " +
                        "t.total_seats, t.available_seats, t.price_per_seat, t.status, t.created_at, " +
                        "u.first_name, u.last_name, u.email " +
                        "FROM trips t JOIN users u ON t.driver_id = u.id ORDER BY t.created_at DESC");
    }

    public void cancelTrip(int tripId) {
        jdbc.update("UPDATE trips SET status = 'CANCELLED' WHERE id = ?", tripId);
    }


    public List<Map<String, Object>> findAllBookings() {
        return jdbc.queryForList(
                "SELECT b.id, b.seats_booked, b.status, b.booked_at, " +
                        "t.origin_city, t.destination_city, t.departure_time, " +
                        "u.first_name AS passenger_first, u.last_name AS passenger_last, u.email AS passenger_email " +
                        "FROM bookings b " +
                        "JOIN trips t ON b.trip_id = t.id " +
                        "JOIN users u ON b.passenger_id = u.id " +
                        "ORDER BY b.booked_at DESC");
    }
}