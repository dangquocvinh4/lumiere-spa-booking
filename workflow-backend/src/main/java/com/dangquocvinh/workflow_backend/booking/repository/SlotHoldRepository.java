package com.dangquocvinh.workflow_backend.booking.repository;

import com.dangquocvinh.workflow_backend.booking.entity.SlotHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface SlotHoldRepository extends JpaRepository<SlotHold, UUID> {
    
    @Query("SELECT s FROM SlotHold s WHERE " +
           "(s.staffId = :staffId OR s.staffId IS NULL) " +
           "AND s.expiresAt > :now " +
           "AND s.startAt < :end AND s.endAt > :start")
    List<SlotHold> findActiveHoldsForStaff(
            @Param("staffId") UUID staffId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("now") LocalDateTime now);

    @Query("SELECT s FROM SlotHold s WHERE " +
           "s.branchId = :branchId " +
           "AND s.expiresAt > :now " +
           "AND s.startAt < :end AND s.endAt > :start")
    List<SlotHold> findActiveHoldsForBranch(
            @Param("branchId") UUID branchId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("now") LocalDateTime now);
}
