package com.dangquocvinh.workflow_backend.booking.repository;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    
    @Query("SELECT a FROM Appointment a WHERE a.staffId = :staffId " +
           "AND a.status != com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus.CANCELLED " +
           "AND a.startAt < :endOfDay AND a.endAt > :startOfDay")
    List<Appointment> findConflictAppointments(@Param("staffId") UUID staffId, 
                                              @Param("startOfDay") LocalDateTime startOfDay, 
                                              @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.branchId = :branchId " +
           "AND a.status NOT IN (com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus.CANCELLED, com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus.COMPLETED) " +
           "AND a.startAt < :end AND a.endAt > :start")
    long countActiveAppointmentsInBranch(@Param("branchId") UUID branchId, 
                                         @Param("start") LocalDateTime start, 
                                         @Param("end") LocalDateTime end);

    long countByCustomerIdAndStatus(UUID customerId, AppointmentStatus status);

    List<Appointment> findByCustomerIdOrderByStartAtDesc(UUID customerId);

    List<Appointment> findByStaffIdOrderByStartAtAsc(UUID staffId);
}
