package com.dangquocvinh.workflow_backend.staff.entity;

import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "staff_profiles")
public class StaffProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "branch_id")
    private UUID branchId;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String bio;

    private Boolean active = true;

    @ManyToMany
    @JoinTable(
        name = "staff_services",
        joinColumns = @JoinColumn(name = "staff_id"),
        inverseJoinColumns = @JoinColumn(name = "service_id")
    )
    private Set<SpaService> services = new HashSet<>();
}
