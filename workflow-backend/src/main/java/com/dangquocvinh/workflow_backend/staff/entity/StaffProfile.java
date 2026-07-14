package com.dangquocvinh.workflow_backend.staff.entity;

import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "staff_profiles")
public class StaffProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, columnDefinition = "VARCHAR(36)")
    private User user;

    @ManyToOne
    @JoinColumn(name = "branch_id", insertable = false, updatable = false)
    private com.dangquocvinh.workflow_backend.catalog.entity.Branch branch;

    @Column(name = "branch_id", columnDefinition = "VARCHAR(36)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID branchId;

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String bio;

    private Boolean active = true;

    @ManyToMany
    @JoinTable(
        name = "staff_services",
        joinColumns = @JoinColumn(name = "staff_id", columnDefinition = "VARCHAR(36)"),
        inverseJoinColumns = @JoinColumn(name = "service_id", columnDefinition = "VARCHAR(36)")
    )
    private Set<SpaService> services = new HashSet<>();
}
