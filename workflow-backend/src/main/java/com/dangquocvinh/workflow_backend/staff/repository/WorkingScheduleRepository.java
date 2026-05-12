package com.dangquocvinh.workflow_backend.staff.repository;

import com.dangquocvinh.workflow_backend.staff.entity.WorkingSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkingScheduleRepository extends JpaRepository<WorkingSchedule, UUID> {
    List<WorkingSchedule> findByStaffId(UUID staffId);
}
