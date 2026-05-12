package com.dangquocvinh.workflow_backend.staff.repository;

import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, UUID> {
    List<StaffProfile> findByBranchId(UUID branchId);

    @Query("SELECT s FROM StaffProfile s JOIN s.services ser WHERE (:branchId IS NULL OR s.branchId = :branchId) AND (:serviceId IS NULL OR ser.id = :serviceId)")
    List<StaffProfile> findByBranchAndService(@Param("branchId") UUID branchId, @Param("serviceId") UUID serviceId);
}
