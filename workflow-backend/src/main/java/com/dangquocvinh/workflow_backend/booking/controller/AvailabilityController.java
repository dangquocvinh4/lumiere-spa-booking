package com.dangquocvinh.workflow_backend.booking.controller;

import com.dangquocvinh.workflow_backend.booking.service.AvailabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/availability")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping
    public ResponseEntity<List<java.util.Map<String, String>>> getAvailability(
            @RequestParam List<UUID> serviceIds,
            @RequestParam UUID branchId,
            @RequestParam(required = false) UUID staffId,
            @RequestParam String date) {
        
        LocalDate localDate = LocalDate.parse(date);
        List<java.util.Map<String, String>> slots = availabilityService.findAvailableSlotsWithStaff(serviceIds, branchId, staffId, localDate);
        
        return ResponseEntity.ok(slots);
    }
}
