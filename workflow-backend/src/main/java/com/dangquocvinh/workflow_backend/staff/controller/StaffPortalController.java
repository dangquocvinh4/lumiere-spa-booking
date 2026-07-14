package com.dangquocvinh.workflow_backend.staff.controller;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.booking.service.BookingManager;
import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff-portal")
@PreAuthorize("hasAnyRole('THERAPIST', 'STAFF', 'ADMIN', 'MANAGER')")
public class StaffPortalController {

    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final AppointmentRepository appointmentRepository;
    private final BookingManager bookingManager;

    public StaffPortalController(UserRepository userRepository, 
                                 StaffProfileRepository staffProfileRepository,
                                 AppointmentRepository appointmentRepository,
                                 BookingManager bookingManager) {
        this.userRepository = userRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.appointmentRepository = appointmentRepository;
        this.bookingManager = bookingManager;
    }

    @GetMapping("/schedule")
    public ResponseEntity<List<Appointment>> getMySchedule(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        StaffProfile profile = staffProfileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Bạn không phải là Kỹ thuật viên (chưa có Staff Profile)"));
            
        List<Appointment> schedule = appointmentRepository.findByStaffIdOrderByStartAtAsc(profile.getId());
        return ResponseEntity.ok(schedule);
    }

    @PatchMapping("/appointment/{id}/complete")
    public ResponseEntity<Appointment> completeAppointment(@PathVariable UUID id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        StaffProfile profile = staffProfileRepository.findByUser(user)
            .orElseThrow(() -> new RuntimeException("Bạn không phải là Kỹ thuật viên"));

        Appointment app = appointmentRepository.findById(id).orElseThrow();
        
        if (!app.getStaffId().equals(profile.getId()) && !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).build(); // Forbidden: không phải ca của mình
        }

        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.COMPLETED));
    }
}
