package com.dangquocvinh.workflow_backend.booking.service;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.catalog.entity.Branch;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.StaffTimeOff;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.staff.repository.StaffTimeOffRepository;
import com.dangquocvinh.workflow_backend.staff.repository.WorkingScheduleRepository;
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

    public AvailabilityService(SpaServiceRepository serviceRepository,
                               StaffProfileRepository staffRepository,
                               WorkingScheduleRepository scheduleRepository,
                               StaffTimeOffRepository timeOffRepository,
                               AppointmentRepository appointmentRepository) {
        this.serviceRepository = serviceRepository;
        this.staffRepository = staffRepository;
        this.scheduleRepository = scheduleRepository;
        this.timeOffRepository = timeOffRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<LocalTime> findAvailableSlots(UUID serviceId, UUID branchId, UUID staffId, LocalDate date) {
        SpaService service = serviceRepository.findById(serviceId).orElseThrow();
        int duration = service.getDurationMinutes();
        
        // 1. Giả định giờ mở cửa Spa (Có thể lấy từ Branch entity nếu có)
        LocalTime spaOpen = LocalTime.of(9, 0);
        LocalTime spaClose = LocalTime.of(21, 0);

        // 2. Lấy lịch làm việc của nhân viên trong ngày đó (dayOfWeek)
        int dayOfWeekVal = date.getDayOfWeek().getValue() + 1; // Map to 2-8
        if (dayOfWeekVal > 8) dayOfWeekVal = 2; // Handle Sunday mapping if needed
        final int targetDay = dayOfWeekVal;
        
        List<WorkingSchedule> schedules = scheduleRepository.findByStaffId(staffId);
        WorkingSchedule todaySchedule = schedules.stream()
                .filter(s -> s.getDayOfWeek() == targetDay)
                .findFirst()
                .orElse(null);

        if (todaySchedule == null) return new ArrayList<>();

        LocalTime startLimit = todaySchedule.getStartTime().isAfter(spaOpen) ? todaySchedule.getStartTime() : spaOpen;
        LocalTime endLimit = todaySchedule.getEndTime().isBefore(spaClose) ? todaySchedule.getEndTime() : spaClose;

        // 3. Lấy danh sách lịch bận (Appointments & TimeOff)
        List<Appointment> appointments = appointmentRepository.findConflictAppointments(staffId, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
        List<StaffTimeOff> timeOffs = timeOffRepository.findByStaffId(staffId);

        // 4. Thuật toán quét Slot (mỗi 30 phút)
        List<LocalTime> availableSlots = new ArrayList<>();
        LocalTime current = startLimit;

        while (current.plusMinutes(duration).isBefore(endLimit) || current.plusMinutes(duration).equals(endLimit)) {
            LocalDateTime slotStart = date.atTime(current);
            LocalDateTime slotEnd = slotStart.plusMinutes(duration);

            if (isStaffAvailable(slotStart, slotEnd, appointments, timeOffs)) {
                availableSlots.add(current);
            }
            current = current.plusMinutes(30);
        }

        return availableSlots;
    }

    private boolean isStaffAvailable(LocalDateTime start, LocalDateTime end, 
                                     List<Appointment> appointments, List<StaffTimeOff> timeOffs) {
        // Kiểm tra xem có đè lên Appointment nào không
        for (Appointment app : appointments) {
            if (start.isBefore(app.getEndAt()) && end.isAfter(app.getStartAt())) {
                return false;
            }
        }
        // Kiểm tra xem có đè lên lịch nghỉ phép (Time Off) không
        for (StaffTimeOff off : timeOffs) {
            if (start.isBefore(off.getEndAt()) && end.isAfter(off.getStartAt())) {
                return false;
            }
        }
        return true;
    }
}
