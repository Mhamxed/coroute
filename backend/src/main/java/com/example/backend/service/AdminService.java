package com.example.backend.service;

import com.example.backend.dto.AdminAuthRequest;
import com.example.backend.dto.AdminStatsResponse;
import com.example.backend.dto.AuthResponse;
import com.example.backend.model.User;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AdminService(UserRepository userRepository,
                        AdminRepository adminRepository,
                        PasswordEncoder passwordEncoder,
                        JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }


    public AuthResponse login(AdminAuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));


        if (!"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generate(user.getId(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getId());
    }


    public AdminStatsResponse getStats() {
        return new AdminStatsResponse(
                adminRepository.countUsers(),
                adminRepository.countDrivers(),
                adminRepository.countPassengers(),
                adminRepository.countTrips(),
                adminRepository.countBookings(),
                adminRepository.countPendingBookings(),
                adminRepository.countUnverifiedDrivers()
        );
    }


    public List<User> getAllUsers()                  { return adminRepository.findAllUsers(); }
    public List<User> searchUsers(String q)         { return adminRepository.searchUsers(q); }
    public void deleteUser(int id)                  { adminRepository.deleteUser(id); }


    public List<Map<String, Object>> getAllDrivers() { return adminRepository.findAllDrivers(); }
    public void verifyDriver(int id)                { adminRepository.verifyDriver(id); }
    public void unverifyDriver(int id)              { adminRepository.unverifyDriver(id); }


    public List<Map<String, Object>> getAllTrips()  { return adminRepository.findAllTrips(); }
    public void cancelTrip(int id)                  { adminRepository.cancelTrip(id); }


    public List<Map<String, Object>> getAllBookings(){ return adminRepository.findAllBookings(); }
}