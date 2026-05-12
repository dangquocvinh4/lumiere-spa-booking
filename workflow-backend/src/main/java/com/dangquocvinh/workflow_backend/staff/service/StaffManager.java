package com.dangquocvinh.workflow_backend.staff.service;

import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import com.dangquocvinh.workflow_backend.staff.repository.StaffProfileRepository;
import com.dangquocvinh.workflow_backend.staff.repository.WorkingScheduleRepository;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StaffManager {

    private final StaffProfileRepository staffRepository;
    private final WorkingScheduleRepository scheduleRepository;
    private final UserRepository userRepository;
    private final SpaServiceRepository serviceRepository;

    public StaffManager(StaffProfileRepository staffRepository, WorkingScheduleRepository scheduleRepository, 
                        UserRepository userRepository, SpaServiceRepository serviceRepository) {
        this.staffRepository = staffRepository;
        this.scheduleRepository = scheduleRepository;
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

    public void addSchedule(UUID staffId, int dayOfWeek, String start, String end) {
        WorkingSchedule schedule = new WorkingSchedule();
        schedule.setStaffId(staffId);
        schedule.setDayOfWeek(dayOfWeek);
        schedule.setStartTime(LocalTime.parse(start));
        schedule.setEndTime(LocalTime.parse(end));
        scheduleRepository.save(schedule);
    }

    public List<WorkingSchedule> getStaffSchedule(UUID staffId) {
        return scheduleRepository.findByStaffId(staffId);
    }

    public List<StaffProfile> getAllProfiles() {
        return staffRepository.findAll();
    }

    public List<StaffProfile> getFilteredProfiles(UUID branchId, UUID serviceId) {
        return staffRepository.findByBranchAndService(branchId, serviceId);
    }

    @Transactional
    public StaffProfile updateProfile(UUID id, String title, String bio, Boolean active) {
        StaffProfile profile = staffRepository.findById(id).orElseThrow();
        if (title != null) profile.setTitle(title);
        if (bio != null) profile.setBio(bio);
        if (active != null) profile.setActive(active);
        return staffRepository.save(profile);
    }

    public void deleteProfile(UUID id) {
        staffRepository.deleteById(id);
    }
}
