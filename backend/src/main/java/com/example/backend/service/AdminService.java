package com.example.backend.service;

import com.example.backend.model.Admin;
import com.example.backend.repository.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public Admin getById(int id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    public List<Admin> getAll() {
        return adminRepository.findAll();
    }

    public void delete(int id) {
        adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        adminRepository.delete(id);
    }
}