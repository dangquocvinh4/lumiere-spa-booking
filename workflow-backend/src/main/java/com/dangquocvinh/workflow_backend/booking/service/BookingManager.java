package com.dangquocvinh.workflow_backend.booking.service;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BookingManager {

    private final AppointmentRepository appointmentRepository;
    private final SpaServiceRepository serviceRepository;

    public BookingManager(AppointmentRepository appointmentRepository, SpaServiceRepository serviceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
    }

    @Transactional
    public Appointment createAppointment(UUID customerId, UUID branchId, UUID staffId, 
                                         List<UUID> serviceIds, LocalDateTime startAt, String note) {
        
        // 1. Tính toán thời gian kết thúc dựa trên tổng duration dịch vụ
        int totalDuration = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (UUID sid : serviceIds) {
            SpaService service = serviceRepository.findById(sid).orElseThrow();
            totalDuration += service.getDurationMinutes();
            totalAmount = totalAmount.add(service.getPrice());
        }
        LocalDateTime endAt = startAt.plusMinutes(totalDuration);

        // 2. CHỐNG TRÙNG LỊCH: Kiểm tra xem nhân viên đã có lịch nào giao thoa chưa
        List<Appointment> conflicts = appointmentRepository.findConflictAppointments(staffId, startAt, endAt);
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Kỹ thuật viên đã bận trong khung giờ này. Vui lòng chọn giờ khác.");
        }

        // 3. Tạo lịch hẹn
        Appointment app = new Appointment();
        app.setCustomerId(customerId);
        app.setBranchId(branchId);
        app.setStaffId(staffId);
        app.setStartAt(startAt);
        app.setEndAt(endAt);
        app.setNote(note);
        app.setTotalAmount(totalAmount);
        app.setStatus("PENDING");

        return appointmentRepository.save(app);
    }

    public Appointment getAppointment(UUID id) {
        return appointmentRepository.findById(id).orElseThrow();
    }

    public Appointment updateStatus(UUID id, String newStatus) {
        Appointment app = appointmentRepository.findById(id).orElseThrow();
        app.setStatus(newStatus);
        return appointmentRepository.save(app);
    }

    public List<Appointment> getMyAppointments(UUID customerId) {
        return appointmentRepository.findAll().stream()
                .filter(app -> app.getCustomerId().equals(customerId))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
