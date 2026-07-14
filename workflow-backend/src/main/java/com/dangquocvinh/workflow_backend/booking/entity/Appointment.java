package com.dangquocvinh.workflow_backend.booking.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(columnDefinition = "VARCHAR(36)")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "customer_id", insertable = false, updatable = false)
    private com.dangquocvinh.workflow_backend.user.entity.User customer;

    @Column(name = "customer_id", columnDefinition = "VARCHAR(36)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID customerId;

    @ManyToOne
    @JoinColumn(name = "branch_id", insertable = false, updatable = false)
    private com.dangquocvinh.workflow_backend.catalog.entity.Branch branch;

    @Column(name = "branch_id", columnDefinition = "VARCHAR(36)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID branchId;

    @ManyToOne
    @JoinColumn(name = "staff_id", insertable = false, updatable = false)
    private com.dangquocvinh.workflow_backend.staff.entity.StaffProfile staff;

    @Column(name = "staff_id", columnDefinition = "VARCHAR(36)")
    @JdbcTypeCode(SqlTypes.VARCHAR)
    private UUID staffId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "appointment_id")
    private List<AppointmentService> services = new ArrayList<>();

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status = AppointmentStatus.PENDING;
    private String note;
    
    @Column(name = "total_amount")
    private BigDecimal totalAmount;

    @Column(name = "voucher_code")
    private String voucherCode;

    @Column(name = "discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount")
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "is_reminded")
    private Boolean isReminded = false;

    public boolean isReminded() {
        return isReminded != null && isReminded;
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
