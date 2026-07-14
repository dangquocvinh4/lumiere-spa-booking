package com.dangquocvinh.workflow_backend.staff.controller;

import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.StaffTimeOff;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.service.StaffManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staff")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class StaffController {

    private final StaffManager staffManager;

    public StaffController(StaffManager staffManager) {
        this.staffManager = staffManager;
    }

    @GetMapping
    public ResponseEntity<List<StaffProfile>> getAllStaff() {
        return ResponseEntity.ok(staffManager.getAllProfiles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffProfile> getStaffById(@PathVariable UUID id) {
        return ResponseEntity.ok(staffManager.getProfileById(id));
    }

    @PostMapping
    public ResponseEntity<StaffProfile> createStaff(@RequestBody Map<String, Object> body) {
        UUID userId = UUID.fromString((String) body.get("userId"));
        
        Object branchIdVal = body.get("branchId");
        UUID branchId = null;
        if (branchIdVal != null && !branchIdVal.toString().trim().isEmpty()) {
            branchId = UUID.fromString(branchIdVal.toString());
        }
        
        String title = (String) body.get("title");
        String bio = (String) body.get("bio");
        StaffProfile profile = staffManager.createStaffProfile(userId, title, bio);
        profile.setBranchId(branchId);
        return ResponseEntity.ok(staffManager.saveProfile(profile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffProfile> updateStaff(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        String fullName = (String) body.get("fullName");
        String title = (String) body.get("title");
        String bio = (String) body.get("bio");
        Boolean active = (Boolean) body.get("active");
        String avatarUrl = (String) body.get("avatarUrl");
        
        Object branchIdVal = body.get("branchId");
        UUID branchId = null;
        if (branchIdVal != null && !branchIdVal.toString().trim().isEmpty()) {
            branchId = UUID.fromString(branchIdVal.toString());
        }
        
        StaffProfile profile = staffManager.updateProfile(id, fullName, title, bio, active, avatarUrl);
        profile.setBranchId(branchId);
        return ResponseEntity.ok(staffManager.saveProfile(profile));
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

    // Schedules
    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<WorkingSchedule>> getSchedules(@PathVariable UUID id) {
        return ResponseEntity.ok(staffManager.getStaffSchedule(id));
    }

    @PostMapping("/{id}/schedules")
    public ResponseEntity<WorkingSchedule> addSchedule(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        int day = (int) body.get("dayOfWeek");
        String start = (String) body.get("startTime");
        String end = (String) body.get("endTime");
        return ResponseEntity.ok(staffManager.addSchedule(id, day, start, end));
    }

    @PutMapping("/{id}/schedules/{scheduleId}")
    public ResponseEntity<WorkingSchedule> updateSchedule(@PathVariable UUID id, @PathVariable UUID scheduleId, @RequestBody Map<String, Object> body) {
        int day = (int) body.get("dayOfWeek");
        String start = (String) body.get("startTime");
        String end = (String) body.get("endTime");
        return ResponseEntity.ok(staffManager.updateSchedule(scheduleId, day, start, end));
    }

    @DeleteMapping("/{id}/schedules/{scheduleId}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable UUID id, @PathVariable UUID scheduleId) {
        staffManager.deleteSchedule(scheduleId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/schedules/copy-from/{sourceId}")
    public ResponseEntity<String> copySchedule(@PathVariable UUID id, @PathVariable UUID sourceId) {
        staffManager.copyScheduleFrom(id, sourceId);
        return ResponseEntity.ok("Đã sao chép lịch làm việc thành công");
    }

    // Time Off
    @GetMapping("/{id}/time-off")
    public ResponseEntity<List<StaffTimeOff>> getTimeOff(@PathVariable UUID id) {
        return ResponseEntity.ok(staffManager.getStaffTimeOff(id));
    }

    @PostMapping("/{id}/time-off")
    public ResponseEntity<StaffTimeOff> addTimeOff(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        LocalDateTime start = LocalDateTime.parse((String) body.get("startAt"));
        LocalDateTime end = LocalDateTime.parse((String) body.get("endAt"));
        String reason = (String) body.get("reason");
        return ResponseEntity.ok(staffManager.addTimeOff(id, start, end, reason));
    }

    @DeleteMapping("/{id}/time-off/{timeOffId}")
    public ResponseEntity<Void> deleteTimeOff(@PathVariable UUID id, @PathVariable UUID timeOffId) {
        staffManager.deleteTimeOff(timeOffId);
        return ResponseEntity.noContent().build();
    }
}
