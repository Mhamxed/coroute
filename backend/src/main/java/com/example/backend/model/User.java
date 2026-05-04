package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private Integer id;
    private String email;

    @JsonIgnore
    private String passwordHash;

    private String firstName;
    private String lastName;
    private String phone;
    private String bio;
    private String avatarUrl;
    private String role;
    private LocalDateTime createdAt;
}