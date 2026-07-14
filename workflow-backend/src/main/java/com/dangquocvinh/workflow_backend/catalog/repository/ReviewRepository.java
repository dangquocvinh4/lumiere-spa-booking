package com.dangquocvinh.workflow_backend.catalog.repository;

import com.dangquocvinh.workflow_backend.catalog.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByServiceIdOrderByCreatedAtDesc(UUID serviceId);
    boolean existsByAppointmentIdAndCustomerId(UUID appointmentId, UUID customerId);
}
