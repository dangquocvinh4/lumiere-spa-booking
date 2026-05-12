package com.dangquocvinh.workflow_backend.staff.controller;

import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.service.StaffManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staff")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
public class StaffController {

    private final StaffManager staffManager;

    public StaffController(StaffManager staffManager) {
        this.staffManager = staffManager;
    }

    @GetMapping
    public ResponseEntity<List<StaffProfile>> getAllStaff() {
        return ResponseEntity.ok(staffManager.getAllProfiles());
    }

    @PostMapping
    public ResponseEntity<StaffProfile> createStaff(@RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString((String) body.get("userId"));
        String title = (String) body.get("title");
        String bio = (String) body.get("bio");
        return ResponseEntity.ok(staffManager.createStaffProfile(userId, title, bio));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffProfile> updateStaff(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        String bio = (String) body.get("bio");
        Boolean active = (Boolean) body.get("active");
        return ResponseEntity.ok(staffManager.updateProfile(id, title, bio, active));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaff(@PathVariable UUID id) {
        staffManager.deleteProfile(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/services")
    public ResponseEntity<String> assignServices(@PathVariable UUID id, @RequestBody List<String> serviceIds) {
        List<UUID> uuids = serviceIds.stream().map(UUID::fromString).toList();
        staffManager.assignServices(id, uuids);
        return ResponseEntity.ok("Đã gán dịch vụ thành công");
    }

    @PostMapping("/{id}/schedules")
    public ResponseEntity<String> addSchedule(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        int day = (int) body.get("dayOfWeek");
        String start = (String) body.get("startTime");
        String end = (String) body.get("endTime");
        staffManager.addSchedule(id, day, start, end);
        return ResponseEntity.ok("Đã thêm lịch làm việc");
    }

    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<WorkingSchedule>> getSchedule(@PathVariable UUID id) {
        return ResponseEntity.ok(staffManager.getStaffSchedule(id));
    }
}
