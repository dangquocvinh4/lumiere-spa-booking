package com.dangquocvinh.workflow_backend.booking.controller;

import com.dangquocvinh.workflow_backend.booking.service.AvailabilityService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public ResponseEntity<List<LocalTime>> getAvailableSlots(
            @RequestParam UUID serviceId,
            @RequestParam UUID branchId,
            @RequestParam UUID staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        return ResponseEntity.ok(availabilityService.findAvailableSlots(serviceId, branchId, staffId, date));
    }
}
