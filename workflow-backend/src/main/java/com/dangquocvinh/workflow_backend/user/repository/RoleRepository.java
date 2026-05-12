package com.dangquocvinh.workflow_backend.user.repository;

import com.dangquocvinh.workflow_backend.user.entity.Role;
import com.dangquocvinh.workflow_backend.user.entity.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RoleRepository extends JpaRepository<Role, UUID> {
    Optional<Role> findByName(RoleName name);
}
