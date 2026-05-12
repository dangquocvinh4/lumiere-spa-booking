package com.dangquocvinh.workflow_backend.staff.repository;

import com.dangquocvinh.workflow_backend.staff.entity.StaffTimeOff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StaffTimeOffRepository extends JpaRepository<StaffTimeOff, UUID> {
    List<StaffTimeOff> findByStaffId(UUID staffId);
}
