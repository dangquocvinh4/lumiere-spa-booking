package com.dangquocvinh.workflow_backend.booking.service;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.catalog.entity.Branch;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.BranchRepository;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.StaffTimeOff;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.staff.repository.StaffTimeOffRepository;
import com.dangquocvinh.workflow_backend.staff.repository.WorkingScheduleRepository;
import com.dangquocvinh.workflow_backend.booking.repository.SlotHoldRepository;
import com.dangquocvinh.workflow_backend.booking.entity.SlotHold;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AvailabilityService {

    private final SpaServiceRepository serviceRepository;
    private final StaffProfileRepository staffRepository;
    private final WorkingScheduleRepository scheduleRepository;
    private final StaffTimeOffRepository timeOffRepository;
    private final AppointmentRepository appointmentRepository;
    private final BranchRepository branchRepository;
    private final SlotHoldRepository slotHoldRepository;

    public AvailabilityService(SpaServiceRepository serviceRepository,
                               StaffProfileRepository staffRepository,
                               WorkingScheduleRepository scheduleRepository,
                               StaffTimeOffRepository timeOffRepository,
                               AppointmentRepository appointmentRepository,
                               BranchRepository branchRepository,
                               SlotHoldRepository slotHoldRepository) {
        this.serviceRepository = serviceRepository;
        this.staffRepository = staffRepository;
        this.scheduleRepository = scheduleRepository;
        this.timeOffRepository = timeOffRepository;
        this.appointmentRepository = appointmentRepository;
        this.branchRepository = branchRepository;
        this.slotHoldRepository = slotHoldRepository;
    }

    public List<java.util.Map<String, String>> findAvailableSlotsWithStaff(List<UUID> serviceIds, UUID branchId, UUID staffId, LocalDate date) {
        java.util.Map<LocalTime, UUID> timeToStaffMap = new java.util.TreeMap<>();

        if (staffId != null) {
            List<LocalTime> slots = findAvailableSlots(serviceIds, branchId, staffId, date);
            for (LocalTime slot : slots) {
                timeToStaffMap.put(slot, staffId);
            }
        } else {
            // "Anyone Available" logic
            List<StaffProfile> allStaff = staffRepository.findByBranchId(branchId);
            for (StaffProfile staff : allStaff) {
                // Check if staff provides all services
                boolean providesAll = serviceIds.stream().allMatch(sid -> 
                        staff.getServices().stream().anyMatch(s -> s.getId().equals(sid)));
                
                if (providesAll && Boolean.TRUE.equals(staff.getActive())) {
                    List<LocalTime> slots = findAvailableSlots(serviceIds, branchId, staff.getId(), date);
                    for (LocalTime slot : slots) {
                        timeToStaffMap.putIfAbsent(slot, staff.getId()); // keep the first available staff for this slot
                    }
                }
            }
        }

        List<java.util.Map<String, String>> result = new ArrayList<>();
        for (java.util.Map.Entry<LocalTime, UUID> entry : timeToStaffMap.entrySet()) {
            java.util.Map<String, String> map = new java.util.HashMap<>();
            map.put("time", entry.getKey().toString());
            map.put("staffId", entry.getValue().toString());
            result.add(map);
        }
        return result;
    }

    public List<LocalTime> findAvailableSlots(List<UUID> serviceIds, UUID branchId, UUID staffId, LocalDate date) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new RuntimeException("Branch not found"));
        StaffProfile staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        LocalDate today = LocalDate.now();
        if (date.isBefore(today) || date.isAfter(today.plusDays(30))) {
            return new ArrayList<>(); // Outside booking window
        }

        // 1. Kiểm tra staff có thuộc branch không
        if (!staff.getBranchId().equals(branchId)) {
            return new ArrayList<>();
        }

        // 2. Kiểm tra staff có cung cấp tất cả các service này không
        boolean providesAllServices = serviceIds.stream().allMatch(sid -> 
                staff.getServices().stream().anyMatch(s -> s.getId().equals(sid)));
        if (!providesAllServices) {
            return new ArrayList<>();
        }

        int totalDuration = 0;
        for (UUID sid : serviceIds) {
            SpaService service = serviceRepository.findById(sid).orElseThrow(() -> new RuntimeException("Service not found"));
            totalDuration += service.getDurationMinutes();
        }
        
        int durationWithBuffer = totalDuration + 15; // 15 mins buffer cho KTV dọn dẹp

        LocalTime spaOpen = branch.getOpeningTime() != null ? branch.getOpeningTime() : LocalTime.of(9, 0);
        LocalTime spaClose = branch.getClosingTime() != null ? branch.getClosingTime() : LocalTime.of(21, 0);

        // 3. Lấy lịch làm việc của nhân viên trong ngày đó (1-7: Mon-Sun)
        int dayOfWeekVal = date.getDayOfWeek().getValue();
        
        List<WorkingSchedule> schedules = scheduleRepository.findByStaffId(staffId);
        WorkingSchedule todaySchedule = schedules.stream()
                .filter(s -> s.getDayOfWeek() == dayOfWeekVal)
                .findFirst()
                .orElse(null);

        if (todaySchedule == null) return new ArrayList<>();

        // Giới hạn thời gian làm việc trong khung giờ của Branch
        LocalTime startLimit = todaySchedule.getStartTime().isAfter(spaOpen) ? todaySchedule.getStartTime() : spaOpen;
        LocalTime endLimit = todaySchedule.getEndTime().isBefore(spaClose) ? todaySchedule.getEndTime() : spaClose;

        // 4. Lấy danh sách lịch bận (Appointments, TimeOffs, & Holds)
        List<Appointment> appointments = appointmentRepository.findConflictAppointments(staffId, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        List<StaffTimeOff> timeOffs = timeOffRepository.findOverlapTimeOffs(staffId, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        List<SlotHold> holds = slotHoldRepository.findActiveHoldsForStaff(staffId, date.atStartOfDay(), date.plusDays(1).atStartOfDay(), LocalDateTime.now());

        // 5. Thuật toán quét Slot (mỗi 30 phút)
        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime current = startLimit;

        // Nếu là ngày hôm nay, khoảng đệm tối thiểu 60 phút (Lead time)
        if (date.equals(today)) {
            // Nếu đã quá giờ đóng cửa (trừ đi 60p lead time) hoặc quá nửa đêm, thì không còn slot nào trong ngày
            if (LocalTime.now().isAfter(endLimit.minusMinutes(60)) || LocalTime.now().isAfter(LocalTime.of(22, 0))) {
                return new ArrayList<>();
            }

            LocalTime nowPlusLeadTime = LocalTime.now().plusMinutes(60);
            if (current.isBefore(nowPlusLeadTime)) {
                current = nowPlusLeadTime;
                // Làm tròn lên 30p
                int minutes = current.getMinute();
                if (minutes > 0 && minutes <= 30) current = current.withMinute(30).withSecond(0).withNano(0);
                else if (minutes > 30) current = current.plusHours(1).withMinute(0).withSecond(0).withNano(0);
            }
        }

        LocalTime lunchStart = LocalTime.of(12, 0);
        LocalTime lunchEnd = LocalTime.of(13, 0);

        while (current.plusMinutes(durationWithBuffer).isBefore(endLimit) || current.plusMinutes(durationWithBuffer).equals(endLimit)) {
            LocalDateTime slotStart = date.atTime(current);
            LocalDateTime slotEnd = slotStart.plusMinutes(durationWithBuffer);
            LocalTime currentEndTime = current.plusMinutes(durationWithBuffer);

            // Kiểm tra đè lên giờ nghỉ trưa
            boolean overlapsLunch = current.isBefore(lunchEnd) && currentEndTime.isAfter(lunchStart);

            if (!overlapsLunch && isStaffAvailable(slotStart, slotEnd, appointments, timeOffs, holds)) {
                // Kiểm tra sức chứa chi nhánh (không tính thời gian buffer khi xét capacity)
                long activeInBranch = appointmentRepository.countActiveAppointmentsInBranch(branchId, slotStart, slotStart.plusMinutes(totalDuration));
                long heldInBranch = slotHoldRepository.findActiveHoldsForBranch(branchId, slotStart, slotStart.plusMinutes(totalDuration), LocalDateTime.now()).size();
                int capacity = branch.getCapacity() != null ? branch.getCapacity() : 10;
                if ((activeInBranch + heldInBranch) < capacity) {
                    availableSlots.add(current);
                }
            }
            current = current.plusMinutes(30);
        }

        return availableSlots;
    }

    private boolean isStaffAvailable(LocalDateTime start, LocalDateTime end, 
                                     List<Appointment> appointments, List<StaffTimeOff> timeOffs, List<SlotHold> holds) {
        for (Appointment app : appointments) {
            // Khi lưu DB, app.endAt chưa có buffer của app đó, nhưng start & end truyền vào ĐÃ CÓ buffer của ca đang xét. 
            // Như vậy hai ca sẽ có khoảng đệm 15p ở cuối.
            if (start.isBefore(app.getEndAt().plusMinutes(15)) && end.isAfter(app.getStartAt()) && app.getStatus() != AppointmentStatus.CANCELLED) {
                return false;
            }
        }
        for (StaffTimeOff off : timeOffs) {
            if (start.isBefore(off.getEndAt()) && end.isAfter(off.getStartAt())) {
                return false;
            }
        }
        for (SlotHold hold : holds) {
            if (start.isBefore(hold.getEndAt()) && end.isAfter(hold.getStartAt())) {
                return false;
            }
        }
        return true;
    }
}
