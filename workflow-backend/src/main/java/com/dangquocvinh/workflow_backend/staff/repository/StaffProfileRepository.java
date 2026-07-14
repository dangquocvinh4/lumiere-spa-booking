package com.dangquocvinh.workflow_backend.staff.repository;

import com.dangquocvinh.workflow_backend.staff.entity.StaffProfile;
import com.dangquocvinh.workflow_backend.user.entity.User;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface StaffProfileRepository extends JpaRepository<StaffProfile, UUID> {
    Optional<StaffProfile> findByUser(User user);
    List<StaffProfile> findByBranchId(UUID branchId);

    @Query("SELECT s FROM StaffProfile s JOIN s.services ser WHERE s.active = true AND (:branchId IS NULL OR s.branchId = :branchId) AND (:serviceId IS NULL OR ser.id = :serviceId)")
    List<StaffProfile> findByBranchAndService(@Param("branchId") UUID branchId, @Param("serviceId") UUID serviceId);

    @Query(value = "SELECT * FROM staff_profiles WHERE id = :id FOR UPDATE", nativeQuery = true)
    Optional<StaffProfile> findStaffProfileByIdStr(@Param("id") String id);

    default Optional<StaffProfile> findStaffProfileById(UUID id) {
        return findStaffProfileByIdStr(id.toString());
    }
}

