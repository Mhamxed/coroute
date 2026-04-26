package com.example.backend.model;
import java.sql.Date;

import jakarta.persistence.*;


@Entity  // This tells JPA to treat this class as a database entity
public class Passenger extends User {

    private Boolean isVerified;  // New field specific to Passenger

    // No-argument constructor
    public Passenger() {}

    // Constructor with parameters, calling the superclass constructor
    public Passenger(String email, String passwordHash, String firstName, String lastName, String phone,
                     String bio, String avatarUrl, Date createdAt, Boolean isVerified) {
        super(email, passwordHash, firstName, lastName, phone, bio, avatarUrl, createdAt);  // Call the User constructor
        this.isVerified = isVerified;  // Set the specific field for Passenger
    }

    // Getter and setter for the new attribute
    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
}