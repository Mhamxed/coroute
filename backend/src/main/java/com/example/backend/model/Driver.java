package com.example.backend.model;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "products")
public class Driver implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 125, nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    @Column
    private String description;

    public Product() {
    }
    //get and sets
}
