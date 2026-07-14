package com.dangquocvinh.workflow_backend.notification.service;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderJob {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    // Run every 15 minutes
    @Scheduled(cron = "0 0/15 * * * *")
    @Transactional
    public void sendReminders() {
        log.info("Bắt đầu quét và gửi email nhắc lịch hẹn...");
        
        // Find appointments happening within the next 24 hours that are CONFIRMED and not yet reminded
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime within24Hours = now.plusHours(24);

        List<Appointment> upcomingAppointments = appointmentRepository.findAll().stream()
                .filter(app -> app.getStatus() == AppointmentStatus.CONFIRMED)
                .filter(app -> !app.isReminded())
                .filter(app -> app.getStartAt().isAfter(now) && app.getStartAt().isBefore(within24Hours))
                .toList();

        if (upcomingAppointments.isEmpty()) {
            log.info("Không có lịch hẹn nào cần nhắc nhở trong lúc này.");
            return;
        }

        int count = 0;
        for (Appointment appointment : upcomingAppointments) {
            try {
                emailService.sendReminderEmail(appointment);
                appointment.setIsReminded(true);
                appointmentRepository.save(appointment);
                count++;
            } catch (Exception e) {
                log.error("Lỗi khi gửi nhắc nhở cho lịch hẹn {}: {}", appointment.getId(), e.getMessage());
            }
        }

        log.info("Hoàn tất gửi nhắc nhở. Tổng số email đã gửi: {}", count);
    }
}
