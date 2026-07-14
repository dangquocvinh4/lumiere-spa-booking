package com.dangquocvinh.workflow_backend.staff.repository;

import com.dangquocvinh.workflow_backend.staff.entity.StaffTimeOff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StaffTimeOffRepository extends JpaRepository<StaffTimeOff, UUID> {
    List<StaffTimeOff> findByStaffId(UUID staffId);

    @Query("SELECT t FROM StaffTimeOff t WHERE t.staffId = :staffId " +
           "AND t.startAt < :endOfDay AND t.endAt > :startOfDay")
    List<StaffTimeOff> findOverlapTimeOffs(@Param("staffId") UUID staffId, 
                                           @Param("startOfDay") LocalDateTime startOfDay, 
                                           @Param("endOfDay") LocalDateTime endOfDay);
}

