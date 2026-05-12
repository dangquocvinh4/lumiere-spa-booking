package com.dangquocvinh.workflow_backend.catalog.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "branches")
public class Branch {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(name = "opening_time")
    private LocalTime openingTime;

    @Column(name = "closing_time")
    private LocalTime closingTime;
}
