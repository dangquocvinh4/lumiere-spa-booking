package com.dangquocvinh.workflow_backend.booking.controller;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class DashboardController {

    private final AppointmentRepository appointmentRepository;
    private final SpaServiceRepository serviceRepository;
    private final StaffProfileRepository staffRepository;

    public DashboardController(AppointmentRepository appointmentRepository, 
                               SpaServiceRepository serviceRepository, 
                               StaffProfileRepository staffRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.staffRepository = staffRepository;
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        Map<String, Object> data = new HashMap<>();

        long totalAppointments = appointmentRepository.count();
        
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        
        // Đây là cách đơn giản, trong thực tế nên viết query trong Repository
        List<Appointment> all = appointmentRepository.findAll();
        
        long todayCount = all.stream()
                .filter(a -> a.getStartAt().isAfter(startOfDay) && a.getStartAt().isBefore(endOfDay))
                .count();

        BigDecimal totalRevenue = all.stream()
                .filter(a -> AppointmentStatus.COMPLETED.equals(a.getStatus()))
                .map(Appointment::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long serviceCount = serviceRepository.count();
        long staffCount = staffRepository.count();

        List<Appointment> recent = all.stream()
                .sorted((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()))
                .limit(5)
                .toList();

        data.put("totalAppointments", totalAppointments);
        data.put("todayAppointments", todayCount);
        data.put("totalRevenue", totalRevenue);
        data.put("serviceCount", serviceCount);
        data.put("staffCount", staffCount);
        data.put("recentAppointments", recent);

        return ResponseEntity.ok(data);
    }

    @GetMapping("/heatmap")
    public ResponseEntity<Map<String, Object>> getHeatmap() {
        List<Appointment> all = appointmentRepository.findAll();
        
        Map<Integer, Map<Integer, Integer>> heatMap = new HashMap<>();
        for (int d = 1; d <= 7; d++) {
            Map<Integer, Integer> hours = new HashMap<>();
            for (int h = 8; h <= 21; h++) {
                hours.put(h, 0);
            }
            heatMap.put(d, hours);
        }
        
        for (Appointment a : all) {
            LocalDateTime dt = a.getStartAt();
            if (dt != null) {
                int day = dt.getDayOfWeek().getValue(); 
                int hour = dt.getHour();
                if (heatMap.containsKey(day) && heatMap.get(day).containsKey(hour)) {
                    heatMap.get(day).put(hour, heatMap.get(day).get(hour) + 1);
                }
            }
        }
        
        List<Map<String, Integer>> result = new ArrayList<>();
        for (Map.Entry<Integer, Map<Integer, Integer>> dayEntry : heatMap.entrySet()) {
            for (Map.Entry<Integer, Integer> hourEntry : dayEntry.getValue().entrySet()) {
                Map<String, Integer> point = new HashMap<>();
                point.put("day", dayEntry.getKey());
                point.put("hour", hourEntry.getKey());
                point.put("count", hourEntry.getValue());
                result.add(point);
            }
        }
        
        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }
}
