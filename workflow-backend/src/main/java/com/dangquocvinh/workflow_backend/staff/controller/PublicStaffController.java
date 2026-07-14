package com.dangquocvinh.workflow_backend.staff.controller;

import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.service.StaffManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
public class PublicStaffController {

    private final StaffManager staffManager;

    public PublicStaffController(StaffManager staffManager) {
        this.staffManager = staffManager;
    }

    @GetMapping
    public ResponseEntity<List<StaffProfile>> getStaff(
            @RequestParam(required = false) UUID branchId,
            @RequestParam(required = false) UUID serviceId) {
        return ResponseEntity.ok(staffManager.getFilteredProfiles(branchId, serviceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffProfile> getStaffById(@PathVariable UUID id) {
        return ResponseEntity.ok(staffManager.getProfileById(id));
    }
}
