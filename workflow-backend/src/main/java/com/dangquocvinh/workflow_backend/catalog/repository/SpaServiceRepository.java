package com.dangquocvinh.workflow_backend.catalog.repository;

import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpaServiceRepository extends JpaRepository<SpaService, UUID> {
    List<SpaService> findByActiveTrue();
}
