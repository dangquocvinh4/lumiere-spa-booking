package com.dangquocvinh.workflow_backend.booking.repository;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    
    @Query("SELECT a FROM Appointment a WHERE a.staffId = :staffId " +
           "AND a.status != 'CANCELLED' " +
           "AND a.startAt < :endOfDay AND a.endAt > :startOfDay")
    List<Appointment> findConflictAppointments(@Param("staffId") UUID staffId, 
                                              @Param("startOfDay") LocalDateTime startOfDay, 
                                              @Param("endOfDay") LocalDateTime endOfDay);
}
