package com.dangquocvinh.workflow_backend.catalog.repository;

import com.dangquocvinh.workflow_backend.catalog.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
}
