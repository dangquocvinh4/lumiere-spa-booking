package com.dangquocvinh.workflow_backend.staff.service;

import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.StaffTimeOff;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.staff.repository.StaffTimeOffRepository;
import com.dangquocvinh.workflow_backend.staff.repository.WorkingScheduleRepository;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StaffManager {

    private final StaffProfileRepository staffRepository;
    private final WorkingScheduleRepository scheduleRepository;
    private final StaffTimeOffRepository timeOffRepository;
    private final UserRepository userRepository;
    private final SpaServiceRepository serviceRepository;

    public StaffManager(StaffProfileRepository staffRepository, 
                        WorkingScheduleRepository scheduleRepository, 
                        StaffTimeOffRepository timeOffRepository,
                        UserRepository userRepository, 
                        SpaServiceRepository serviceRepository) {
        this.staffRepository = staffRepository;
        this.scheduleRepository = scheduleRepository;
        this.timeOffRepository = timeOffRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
    }

    public StaffProfile createStaffProfile(UUID userId, String title, String bio) {
        User user = userRepository.findById(userId).orElseThrow();
        StaffProfile profile = new StaffProfile();
        profile.setUser(user);
        profile.setTitle(title);
        profile.setBio(bio);
        return staffRepository.save(profile);
    }

    @Transactional
    public void assignServices(UUID staffId, List<UUID> serviceIds) {
        StaffProfile profile = staffRepository.findById(staffId).orElseThrow();
        Set<SpaService> services = serviceIds.stream()
                .map(id -> serviceRepository.findById(id).orElseThrow())
                .collect(Collectors.toSet());
        profile.setServices(services);
        staffRepository.save(profile);
    }

    @Transactional
    public WorkingSchedule addSchedule(UUID staffId, int dayOfWeek, String start, String end) {
        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setStaffId(staffId);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setStartTime(LocalTime.parse(start));
        schedule.setEndTime(LocalTime.parse(end));
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public WorkingSchedule updateSchedule(UUID scheduleId, int dayOfWeek, String start, String end) {
        WorkingSchedule schedule = scheduleRepository.findById(scheduleId).orElseThrow();
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setStartTime(LocalTime.parse(start));
        schedule.setEndTime(LocalTime.parse(end));
        return scheduleRepository.save(schedule);
    }

    @Transactional
    public void deleteSchedule(UUID scheduleId) {
        scheduleRepository.deleteById(scheduleId);
    }

    @Transactional
    public void copyScheduleFrom(UUID targetStaffId, UUID sourceStaffId) {
        List<WorkingSchedule> existing = scheduleRepository.findByStaffId(targetStaffId);
        scheduleRepository.deleteAll(existing);

        List<WorkingSchedule> sourceSchedules = scheduleRepository.findByStaffId(sourceStaffId);
        for (WorkingSchedule source : sourceSchedules) {
            WorkingSchedule copied = new WorkingSchedule();
            copied.setStaffId(targetStaffId);
            copied.setDayOfWeek(source.getDayOfWeek());
            copied.setStartTime(source.getStartTime());
            copied.setEndTime(source.getEndTime());
            scheduleRepository.save(copied);
        }
    }

    public List<WorkingSchedule> getStaffSchedule(UUID staffId) {
        return scheduleRepository.findByStaffId(staffId);
    }

    @Transactional
    public StaffTimeOff addTimeOff(UUID staffId, LocalDateTime start, LocalDateTime end, String reason) {
        StaffTimeOff timeOff = new StaffTimeOff();
        timeOff.setStaffId(staffId);
        timeOff.setStartAt(start);
        timeOff.setEndAt(end);
        timeOff.setReason(reason);
        return timeOffRepository.save(timeOff);
    }

    public List<StaffTimeOff> getStaffTimeOff(UUID staffId) {
        return timeOffRepository.findByStaffId(staffId);
    }

    @Transactional
    public void deleteTimeOff(UUID timeOffId) {
        timeOffRepository.deleteById(timeOffId);
    }

    public List<StaffProfile> getAllProfiles() {
        return staffRepository.findAll();
    }

    public List<StaffProfile> getFilteredProfiles(UUID branchId, UUID serviceId) {
        return staffRepository.findByBranchAndService(branchId, serviceId);
    }

    @Transactional
    public StaffProfile updateProfile(UUID id, String fullName, String title, String bio, Boolean active, String avatarUrl) {
        StaffProfile profile = staffRepository.findById(id).orElseThrow();
        if (title != null) profile.setTitle(title);
        if (bio != null) profile.setBio(bio);
        if (active != null) profile.setActive(active);
        
        User user = profile.getUser();
        if (user != null) {
            if (fullName != null && !fullName.trim().isEmpty()) {
                user.setFullName(fullName);
            }
            if (avatarUrl != null) {
                user.setAvatarUrl(avatarUrl);
            }
            userRepository.save(user);
        }
        return staffRepository.save(profile);
    }

    public StaffProfile getProfileById(UUID id) {
        return staffRepository.findById(id).orElseThrow();
    }

    public StaffProfile saveProfile(StaffProfile profile) {
        return staffRepository.save(profile);
    }

    public void deleteProfile(UUID id) {
        staffRepository.deleteById(id);
    }
}
