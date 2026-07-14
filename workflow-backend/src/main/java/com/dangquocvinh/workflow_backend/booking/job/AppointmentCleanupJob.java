package com.dangquocvinh.workflow_backend.booking.job;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.entity.PaymentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentCleanupJob {

    private final AppointmentRepository appointmentRepository;

    /**
     * Chạy mỗi 5 phút.
     * Hủy các lịch hẹn PENDING, chưa thanh toán (PENDING) sau 15 phút kể từ khi tạo.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void cancelUnpaidAppointments() {
        LocalDateTime timeLimit = LocalDateTime.now().minusMinutes(15);
        List<Appointment> unpaidAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING)
                .filter(a -> a.getPaymentStatus() == PaymentStatus.PENDING)
                .filter(a -> a.getCreatedAt() != null && a.getCreatedAt().isBefore(timeLimit))
                .toList();

        for (Appointment a : unpaidAppointments) {
            a.setStatus(AppointmentStatus.CANCELLED);
            a.setNote(a.getNote() != null ? a.getNote() + " [Hệ thống tự động hủy do không thanh toán cọc]" : "[Hệ thống tự động hủy do không thanh toán cọc]");
            log.info("Tự động hủy lịch hẹn chưa thanh toán: {}", a.getId());
        }
        appointmentRepository.saveAll(unpaidAppointments);
    }

    /**
     * Chạy mỗi 15 phút.
     * Đánh dấu NO_SHOW các lịch hẹn đã xác nhận/đặt cọc nhưng khách không đến (quá 30 phút kể từ giờ bắt đầu).
     */
    @Scheduled(fixedRate = 900000)
    @Transactional
    public void markNoShowAppointments() {
        LocalDateTime timeLimit = LocalDateTime.now().minusMinutes(30);
        List<Appointment> noShowAppointments = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED)
                .filter(a -> a.getStartAt() != null && a.getStartAt().isBefore(timeLimit))
                .toList();

        for (Appointment a : noShowAppointments) {
            a.setStatus(AppointmentStatus.NO_SHOW);
            a.setNote(a.getNote() != null ? a.getNote() + " [Khách không đến]" : "[Khách không đến]");
            log.info("Đánh dấu Khách không đến (Mất cọc) cho lịch hẹn: {}", a.getId());
        }
        appointmentRepository.saveAll(noShowAppointments);
    }
}
