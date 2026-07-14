package com.dangquocvinh.workflow_backend.booking.controller;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.service.BookingManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/appointments")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
public class AdminBookingController {

    private final BookingManager bookingManager;

    public AdminBookingController(BookingManager bookingManager) {
        this.bookingManager = bookingManager;
    }

    @GetMapping
    public ResponseEntity<List<Appointment>> getAdmin(
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) UUID staffId,
            @RequestParam(required = false) AppointmentStatus status,
            @RequestParam(required = false) String date) {
        
        List<Appointment> all = bookingManager.getAllAppointments();
        
        List<Appointment> filtered = all.stream().filter(a -> {
            if (branchId != null && !branchId.equals(a.getBranchId())) return false;
            if (staffId != null && !staffId.equals(a.getStaffId())) return false;
            if (status != null && !status.equals(a.getStatus())) return false;
            if (date != null && !a.getStartAt().toLocalDate().toString().equals(date)) return false;
            return true;
        }).toList();

        return ResponseEntity.ok(filtered);
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<Appointment> confirm(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.CONFIRMED));
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<Appointment> checkIn(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.CHECKED_IN));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Appointment> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.COMPLETED));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancel(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.CANCELLED));
    }
}
