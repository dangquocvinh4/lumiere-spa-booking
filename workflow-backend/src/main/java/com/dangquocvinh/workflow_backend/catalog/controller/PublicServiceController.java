package com.dangquocvinh.workflow_backend.catalog.controller;

import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.service.SpaServiceManager;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/services")
public class PublicServiceController {

    private final SpaServiceManager serviceManager;

    public PublicServiceController(SpaServiceManager serviceManager) {
        this.serviceManager = serviceManager;
    }

    @GetMapping
    public ResponseEntity<List<SpaService>> getActiveServices() {
        return ResponseEntity.ok(serviceManager.getAllActiveServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpaService> getServiceDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(serviceManager.getServiceById(id));
    }
}
