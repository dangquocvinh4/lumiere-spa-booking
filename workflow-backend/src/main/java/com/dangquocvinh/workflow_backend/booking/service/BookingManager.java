package com.dangquocvinh.workflow_backend.booking.service;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentService;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.booking.repository.SlotHoldRepository;
import com.dangquocvinh.workflow_backend.booking.entity.SlotHold;
import com.dangquocvinh.workflow_backend.booking.repository.VoucherRepository;
import com.dangquocvinh.workflow_backend.booking.entity.Voucher;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.notification.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class BookingManager {

    private final AppointmentRepository appointmentRepository;
    private final SpaServiceRepository serviceRepository;
    private final StaffProfileRepository staffRepository;
    private final SlotHoldRepository slotHoldRepository;
    private final VoucherRepository voucherRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public BookingManager(AppointmentRepository appointmentRepository, 
                          SpaServiceRepository serviceRepository,
                          StaffProfileRepository staffRepository,
                          SlotHoldRepository slotHoldRepository,
                          VoucherRepository voucherRepository,
                          UserRepository userRepository,
                          EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.serviceRepository = serviceRepository;
        this.staffRepository = staffRepository;
        this.slotHoldRepository = slotHoldRepository;
        this.voucherRepository = voucherRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Appointment createAppointment(UUID currentUserId, UUID customerId, UUID branchId, UUID staffId, 
                                         List<UUID> serviceIds, LocalDateTime startAt, String note, String voucherCode) {
        // Pessimistic write lock staff profile to serialize booking requests
        staffRepository.findStaffProfileById(staffId)
                .orElseThrow(() -> new RuntimeException("Kỹ thuật viên không tồn tại"));
        
        int totalDuration = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (UUID sid : serviceIds) {
            SpaService service = serviceRepository.findById(sid).orElseThrow();
            totalDuration += service.getDurationMinutes();
            totalAmount = totalAmount.add(service.getPrice());
        }
        LocalDateTime endAt = startAt.plusMinutes(totalDuration);

        validateBookingBusinessRules(customerId, startAt);
        // Pass currentUserId and customerId to allow the holding user to book it
        validateConflict(staffId, startAt, endAt, null, currentUserId, customerId);

        BigDecimal discountAmount = BigDecimal.ZERO;
        if (voucherCode != null && !voucherCode.isBlank()) {
            Voucher voucher = voucherRepository.findByCode(voucherCode)
                    .orElseThrow(() -> new IllegalArgumentException("Mã khuyến mãi không tồn tại"));
            
            if (!voucher.getActive()) throw new IllegalArgumentException("Mã khuyến mãi đã ngừng hoạt động");
            if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                throw new IllegalArgumentException("Mã khuyến mãi đã hết lượt sử dụng");
            }
            if (voucher.getStartDate() != null && LocalDateTime.now().isBefore(voucher.getStartDate())) {
                throw new IllegalArgumentException("Mã khuyến mãi chưa tới thời gian áp dụng");
            }
            if (voucher.getEndDate() != null && LocalDateTime.now().isAfter(voucher.getEndDate())) {
                throw new IllegalArgumentException("Mã khuyến mãi đã hết hạn");
            }
            if (voucher.getMinOrderValue() != null && totalAmount.compareTo(voucher.getMinOrderValue()) < 0) {
                throw new IllegalArgumentException("Giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng mã này");
            }

            discountAmount = totalAmount.multiply(BigDecimal.valueOf(voucher.getDiscountPercent())).divide(BigDecimal.valueOf(100));
            if (voucher.getMaxDiscountAmount() != null && discountAmount.compareTo(voucher.getMaxDiscountAmount()) > 0) {
                discountAmount = voucher.getMaxDiscountAmount();
            }

            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);
        }
        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        Appointment app = new Appointment();
        app.setCustomerId(customerId);
        app.setBranchId(branchId);
        app.setStaffId(staffId);
        app.setStartAt(startAt);
        app.setEndAt(endAt);
        app.setNote(note);
        app.setTotalAmount(totalAmount);
        app.setDiscountAmount(discountAmount);
        app.setFinalAmount(finalAmount);
        app.setVoucherCode(voucherCode);
        app.setStatus(AppointmentStatus.PENDING);

        for (UUID sid : serviceIds) {
            SpaService service = serviceRepository.findById(sid).orElseThrow();
            AppointmentService snapshot = new AppointmentService();
            snapshot.setServiceId(service.getId());
            snapshot.setServiceName(service.getName());
            snapshot.setPrice(service.getPrice());
            snapshot.setDurationMinutes(service.getDurationMinutes());
            app.getServices().add(snapshot);
        }

        Appointment saved = appointmentRepository.save(app);

        // Gửi email đặt lịch thành công
        try {
            Appointment fullApp = appointmentRepository.findById(saved.getId()).orElse(saved);
            emailService.sendBookingReceivedEmail(fullApp);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email xác nhận đặt lịch cho ID: {}", saved.getId(), e);
        }

        return saved;
    }

    @Transactional
    public Appointment reschedule(UUID currentUserId, UUID id, LocalDateTime newStartAt) {
        Appointment app = appointmentRepository.findById(id).orElseThrow();
        
        // Pessimistic write lock staff profile to serialize reschedule requests
        staffRepository.findStaffProfileById(app.getStaffId())
                .orElseThrow(() -> new RuntimeException("Kỹ thuật viên không tồn tại"));
        
        // Chỉ cho phép đổi lịch nếu chưa CHECK_IN/COMPLETED/CANCELLED
        if (app.getStatus() != AppointmentStatus.PENDING && app.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalArgumentException("Không thể đổi lịch hẹn ở trạng thái hiện tại: " + app.getStatus());
        }

        int duration = (int) java.time.Duration.between(app.getStartAt(), app.getEndAt()).toMinutes();
        LocalDateTime newEndAt = newStartAt.plusMinutes(duration);

        validateBookingBusinessRules(app.getCustomerId(), newStartAt);
        validateConflict(app.getStaffId(), newStartAt, newEndAt, id, currentUserId, app.getCustomerId());

        app.setStartAt(newStartAt);
        app.setEndAt(newEndAt);
        // Reset status về PENDING nếu cần
        app.setStatus(AppointmentStatus.PENDING);
        
        Appointment saved = appointmentRepository.save(app);

        // Gửi email thông báo dời lịch hẹn thành công (đang chờ duyệt lại)
        try {
            emailService.sendBookingReceivedEmail(saved);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email thông báo dời lịch cho ID: {}", saved.getId(), e);
        }

        return saved;
    }

    private void validateBookingBusinessRules(UUID customerId, LocalDateTime startAt) {
        LocalDateTime now = LocalDateTime.now();
        if (startAt.isBefore(now)) {
            throw new IllegalArgumentException("Không thể đặt lịch hẹn trong quá khứ.");
        }
        if (startAt.isBefore(now.plusMinutes(60))) {
            throw new IllegalArgumentException("Thời gian đặt lịch tối thiểu phải trước giờ hẹn 60 phút.");
        }
        if (startAt.isAfter(now.plusDays(30))) {
            throw new IllegalArgumentException("Chỉ cho phép đặt lịch trước tối đa 30 ngày.");
        }
        
        long pendingCount = appointmentRepository.countByCustomerIdAndStatus(customerId, AppointmentStatus.PENDING);
        if (pendingCount >= 3) {
            throw new IllegalArgumentException("Bạn đã đạt giới hạn tối đa 3 lịch hẹn chờ xác nhận. Vui lòng đợi quản trị viên duyệt trước khi đặt lịch mới.");
        }
    }

    private void validateConflict(UUID staffId, LocalDateTime start, LocalDateTime end, UUID excludeId, UUID currentUserId, UUID customerId) {
        List<Appointment> conflicts = appointmentRepository.findConflictAppointments(staffId, start, end);
        for (Appointment conflict : conflicts) {
            if (excludeId != null && conflict.getId().equals(excludeId)) continue;
            if (conflict.getStatus() != AppointmentStatus.CANCELLED) {
                throw new IllegalArgumentException("Kỹ thuật viên đã bận trong khung giờ này.");
            }
        }
        
        List<SlotHold> holds = slotHoldRepository.findActiveHoldsForStaff(staffId, start, end, LocalDateTime.now());
        for (SlotHold hold : holds) {
            if (hold.getSessionId() != null && 
                (hold.getSessionId().equals(currentUserId.toString()) || hold.getSessionId().equals(customerId.toString()))) {
                continue; // It's this user's hold or the customer's hold, allow it
            }
            throw new IllegalArgumentException("Khung giờ này vừa có người khác chọn. Vui lòng chọn giờ khác.");
        }
    }

    public Appointment getAppointment(UUID id) {
        return appointmentRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Appointment updateStatus(UUID id, AppointmentStatus newStatus) {
        Appointment app = appointmentRepository.findById(id).orElseThrow();
        AppointmentStatus current = app.getStatus();

        // Kiểm tra logic chuyển đổi trạng thái
        if (newStatus == AppointmentStatus.CONFIRMED && current != AppointmentStatus.PENDING) {
            throw new IllegalArgumentException("Chỉ có thể xác nhận lịch hẹn đang chờ (PENDING).");
        }
        if (newStatus == AppointmentStatus.CHECKED_IN && current != AppointmentStatus.CONFIRMED) {
            throw new IllegalArgumentException("Chỉ có thể check-in lịch hẹn đã xác nhận (CONFIRMED).");
        }
        if (newStatus == AppointmentStatus.COMPLETED && current != AppointmentStatus.CHECKED_IN) {
            throw new IllegalArgumentException("Chỉ có thể hoàn thành lịch hẹn đã check-in (CHECKED_IN).");
        }
        
        if (newStatus == AppointmentStatus.COMPLETED && current == AppointmentStatus.CHECKED_IN) {
            // Tích điểm cho khách: Cứ 100k = 1 điểm
            User customer = userRepository.findById(app.getCustomerId()).orElse(null);
            if (customer != null && app.getFinalAmount() != null) {
                int pointsEarned = app.getFinalAmount().divide(BigDecimal.valueOf(100000)).intValue();
                customer.setLoyaltyPoints(customer.getLoyaltyPoints() + pointsEarned);
                userRepository.save(customer);
            }
        }

        if (newStatus == AppointmentStatus.CANCELLED && (current == AppointmentStatus.COMPLETED)) {
            throw new IllegalArgumentException("Không thể hủy lịch hẹn đã hoàn thành.");
        }
        
        if (newStatus == AppointmentStatus.CANCELLED && (current == AppointmentStatus.PENDING || current == AppointmentStatus.CONFIRMED)) {
            if (LocalDateTime.now().plusHours(2).isAfter(app.getStartAt())) {
                throw new IllegalArgumentException("Không thể tự hủy lịch hẹn sát giờ phục vụ (dưới 2 tiếng). Vui lòng gọi Hotline để được hỗ trợ.");
            }
        }

        app.setStatus(newStatus);
        Appointment saved = appointmentRepository.save(app);

        // Gửi email thông báo trạng thái
        if (newStatus == AppointmentStatus.CONFIRMED) {
            try {
                emailService.sendAppointmentConfirmedEmail(saved);
            } catch (Exception e) {
                log.error("Lỗi khi gửi email xác nhận cho ID: {}", saved.getId(), e);
            }
        } else if (newStatus == AppointmentStatus.CANCELLED) {
            try {
                emailService.sendAppointmentCancelledEmail(saved);
            } catch (Exception e) {
                log.error("Lỗi khi gửi email hủy lịch cho ID: {}", saved.getId(), e);
            }
        }

        return saved;
    }

    public List<Appointment> getMyAppointments(UUID customerId) {
        return appointmentRepository.findByCustomerIdOrderByStartAtDesc(customerId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
}
