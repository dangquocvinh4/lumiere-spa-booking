package com.dangquocvinh.workflow_backend.booking.controller;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.service.BookingManager;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class BookingController {

    private final BookingManager bookingManager;
    private final UserRepository userRepository;

    public BookingController(BookingManager bookingManager, UserRepository userRepository) {
        this.bookingManager = bookingManager;
        this.userRepository = userRepository;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Appointment>> getMy(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(bookingManager.getMyAppointments(user.getId()));
    }

    @GetMapping("/admin")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<List<Appointment>> getAdmin(
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String date) {
        // Tạm thời trả về toàn bộ, sẽ tối ưu filter trong BookingManager nếu cần
        return ResponseEntity.ok(bookingManager.getAllAppointments());
    }

    @PostMapping
    public ResponseEntity<Appointment> create(@RequestBody Map<String, Object> body, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        UUID customerId = user.getId();

        UUID branchId = UUID.fromString((String) body.get("branchId"));
        UUID staffId = UUID.fromString((String) body.get("staffId"));
        List<UUID> serviceIds = ((List<String>) body.get("serviceIds")).stream().map(UUID::fromString).toList();
        LocalDateTime startAt = LocalDateTime.parse((String) body.get("startAt"));
        String note = (String) body.get("note");

        return ResponseEntity.ok(bookingManager.createAppointment(customerId, branchId, staffId, serviceIds, startAt, note));
    }

    @PatchMapping("/{id}/confirm")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<Appointment> confirm(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, "CONFIRMED"));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancel(@PathVariable UUID id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Appointment app = bookingManager.getAppointment(id); // Giả sử có getAppointment
        if (!app.getCustomerId().equals(user.getId()) && 
            !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().startsWith("ROLE_ADMIN") || a.getAuthority().startsWith("ROLE_MANAGER"))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingManager.updateStatus(id, "CANCELLED"));
    }

    @PatchMapping("/{id}/check-in")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<Appointment> checkIn(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, "CHECKED_IN"));
    }

    @PatchMapping("/{id}/complete")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_RECEPTIONIST')")
    public ResponseEntity<Appointment> complete(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, "COMPLETED"));
    }
}
