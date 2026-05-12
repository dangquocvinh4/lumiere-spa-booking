package com.dangquocvinh.workflow_backend.catalog.controller;

import com.dangquocvinh.workflow_backend.catalog.dto.ServiceDto;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.service.SpaServiceManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/services")
@PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
public class AdminServiceController {

    private final SpaServiceManager serviceManager;

    public AdminServiceController(SpaServiceManager serviceManager) {
        this.serviceManager = serviceManager;
    }

    @PostMapping
    public ResponseEntity<SpaService> createService(@RequestBody ServiceDto dto) {
        return ResponseEntity.ok(serviceManager.createService(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpaService> updateService(@PathVariable UUID id, @RequestBody ServiceDto dto) {
        return ResponseEntity.ok(serviceManager.updateService(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteService(@PathVariable UUID id) {
        serviceManager.softDeleteService(id);
        return ResponseEntity.ok("Đã vô hiệu hóa dịch vụ!");
    }
}
