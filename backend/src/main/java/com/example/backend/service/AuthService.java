package com.example.backend.service;

import com.example.backend.dto.AuthRequest;
import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.User;
import com.example.backend.model.Vehicule;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.VehiculeRepository;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.PassengerRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PassengerRepository passengerRepository;
    private final AdminRepository adminRepository;
    private final VehiculeRepository vehiculeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       DriverRepository driverRepository,
                       PassengerRepository passengerRepository,
                       AdminRepository adminRepository,
                       VehiculeRepository vehiculeRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.driverRepository = driverRepository;
        this.passengerRepository = passengerRepository;
        this.adminRepository = adminRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        String role = req.getRole().toUpperCase();
        if (!role.equals("PASSENGER") && !role.equals("DRIVER") && !role.equals("ADMIN")) {
            throw new RuntimeException("Invalid role: " + role);
        }

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setPhone(req.getPhone());
        user.setRole(role);

        int userId = userRepository.create(user);

        switch (role) {
            case "DRIVER" -> {
                Vehicule v = new Vehicule();
                v.setPlateNumber(req.getVehiclePlate());
                vehiculeRepository.create(v);
                driverRepository.create(userId, req.getLicenceNumber(), req.getVehiclePlate());
            }
            case "PASSENGER" -> passengerRepository.create(userId);
            case "ADMIN" -> adminRepository.create(userId);
        }

        String token = jwtUtil.generate(userId, role);
        return new AuthResponse(token, role, userId);
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generate(user.getId(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getId());
    }
}