package com.dangquocvinh.workflow_backend.booking.controller;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.entity.SlotHold;
import com.dangquocvinh.workflow_backend.booking.repository.SlotHoldRepository;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.booking.service.BookingManager;
import com.dangquocvinh.workflow_backend.user.entity.Role;
import com.dangquocvinh.workflow_backend.user.entity.RoleName;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.RoleRepository;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.HashSet;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
public class BookingController {

    private final BookingManager bookingManager;
    private final UserRepository userRepository;
    private final SlotHoldRepository slotHoldRepository;
    private final SpaServiceRepository serviceRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public BookingController(BookingManager bookingManager, 
                             UserRepository userRepository,
                             SlotHoldRepository slotHoldRepository,
                             SpaServiceRepository serviceRepository,
                             RoleRepository roleRepository,
                             PasswordEncoder passwordEncoder) {
        this.bookingManager = bookingManager;
        this.userRepository = userRepository;
        this.slotHoldRepository = slotHoldRepository;
        this.serviceRepository = serviceRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Appointment>> getMy(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(bookingManager.getMyAppointments(user.getId()));
    }

    /**
     * @deprecated Use /api/admin/appointments
     */
    @Deprecated
    @GetMapping("/admin")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<List<Appointment>> getAdminLegacy(
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

    @PostMapping
    public ResponseEntity<Appointment> create(@RequestBody Map<String, Object> body, Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        UUID customerId;
        
        // If receptionist/admin is booking for a customer
        boolean isAdminOrReceptionist = currentUser.getRoles().stream()
                .anyMatch(r -> r.getName() == RoleName.ROLE_ADMIN || r.getName() == RoleName.ROLE_MANAGER || r.getName() == RoleName.ROLE_RECEPTIONIST);
                
        if (isAdminOrReceptionist && body.containsKey("customerPhone") && body.get("customerPhone") != null) {
            String phone = (String) body.get("customerPhone");
            String name = (String) body.get("customerName");
            
            User customer = userRepository.findFirstByPhone(phone).orElseGet(() -> {
                User newUser = new User();
                newUser.setPhone(phone);
                newUser.setFullName(name);
                newUser.setEmail(phone + "@spa.local"); // dummy email
                newUser.setPassword(passwordEncoder.encode("default123"));
                Role role = roleRepository.findByName(RoleName.ROLE_CUSTOMER).orElseThrow();
                newUser.setRoles(new HashSet<>(Collections.singletonList(role)));
                return userRepository.save(newUser);
            });
            customerId = customer.getId();
        } else {
            customerId = currentUser.getId();
        }

        UUID branchId = UUID.fromString((String) body.get("branchId"));
        UUID staffId = UUID.fromString((String) body.get("staffId"));
        List<UUID> serviceIds = ((List<String>) body.get("serviceIds")).stream().map(UUID::fromString).toList();
        LocalDateTime startAt = LocalDateTime.parse((String) body.get("startAt"));
        String note = (String) body.get("note");
        String voucherCode = body.containsKey("voucherCode") ? (String) body.get("voucherCode") : null;

        Appointment app = bookingManager.createAppointment(currentUser.getId(), customerId, branchId, staffId, serviceIds, startAt, note, voucherCode);
        
        if (isAdminOrReceptionist) {
            app = bookingManager.updateStatus(app.getId(), AppointmentStatus.CONFIRMED);
        }
        
        return ResponseEntity.ok(app);
    }

    @PostMapping("/hold")
    public ResponseEntity<?> holdSlot(@RequestBody Map<String, Object> body, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        
        UUID branchId = UUID.fromString((String) body.get("branchId"));
        UUID staffId = body.get("staffId") != null ? UUID.fromString((String) body.get("staffId")) : null;
        List<UUID> serviceIds = ((List<String>) body.get("serviceIds")).stream().map(UUID::fromString).toList();
        LocalDateTime startAt = LocalDateTime.parse((String) body.get("startAt"));
        
        int totalDuration = 0;
        for (UUID sid : serviceIds) {
            SpaService service = serviceRepository.findById(sid).orElseThrow();
            totalDuration += service.getDurationMinutes();
        }
        LocalDateTime endAt = startAt.plusMinutes(totalDuration);

        // Remove any previous holds by this user (only 1 hold at a time)
        // Usually handled by a scheduled job or just ignored, but it's cleaner
        
        SlotHold hold = new SlotHold();
        hold.setBranchId(branchId);
        hold.setStaffId(staffId);
        hold.setStartAt(startAt);
        hold.setEndAt(endAt);
        hold.setSessionId(user.getId().toString());
        hold.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        
        slotHoldRepository.save(hold);
        
        return ResponseEntity.ok(Map.of("success", true, "holdId", hold.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getById(@PathVariable UUID id, Authentication authentication) {
        Appointment app = bookingManager.getAppointment(id);
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        
        if (!app.getCustomerId().equals(user.getId()) && 
            !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER") || a.getAuthority().equals("ROLE_RECEPTIONIST"))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(app);
    }

    @PatchMapping("/{id}/reschedule")
    public ResponseEntity<Appointment> reschedule(@PathVariable UUID id, @RequestBody Map<String, String> body, Authentication authentication) {
        Appointment app = bookingManager.getAppointment(id);
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        if (!app.getCustomerId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        LocalDateTime newStartAt = LocalDateTime.parse(body.get("startAt"));
        return ResponseEntity.ok(bookingManager.reschedule(user.getId(), id, newStartAt));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Appointment> cancel(@PathVariable UUID id, Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Appointment app = bookingManager.getAppointment(id);
        
        if (!app.getCustomerId().equals(user.getId()) && 
            !authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_MANAGER"))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.CANCELLED));
    }

    // --- Legacy Admin Mapping ---

    @PatchMapping("/{id}/confirm")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Appointment> confirmLegacy(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.CONFIRMED));
    }

    @PatchMapping("/{id}/check-in")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Appointment> checkInLegacy(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.CHECKED_IN));
    }

    @PatchMapping("/{id}/complete")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
    public ResponseEntity<Appointment> completeLegacy(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingManager.updateStatus(id, AppointmentStatus.COMPLETED));
    }
}
