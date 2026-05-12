package com.dangquocvinh.workflow_backend.catalog.service;

import com.dangquocvinh.workflow_backend.catalog.dto.ServiceDto;
import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SpaServiceManager {

    private final SpaServiceRepository serviceRepository;

    public SpaServiceManager(SpaServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    public List<SpaService> getAllActiveServices() {
        return serviceRepository.findByActiveTrue();
    }

    public SpaService getServiceById(UUID id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dịch vụ: " + id));
    }

    public SpaService createService(ServiceDto dto) {
        SpaService service = new SpaService();
        service.setName(dto.getName());
        service.setDescription(dto.getDescription());
        service.setPrice(dto.getPrice());
        service.setDurationMinutes(dto.getDurationMinutes());
        service.setImageUrl(dto.getImageUrl());
        service.setCategory(dto.getCategory());
        return serviceRepository.save(service);
    }

    public SpaService updateService(UUID id, ServiceDto dto) {
        SpaService service = getServiceById(id);
        if (dto.getName() != null) service.setName(dto.getName());
        if (dto.getDescription() != null) service.setDescription(dto.getDescription());
        if (dto.getPrice() != null) service.setPrice(dto.getPrice());
        if (dto.getDurationMinutes() != null) service.setDurationMinutes(dto.getDurationMinutes());
        if (dto.getImageUrl() != null) service.setImageUrl(dto.getImageUrl());
        if (dto.getCategory() != null) service.setCategory(dto.getCategory());
        return serviceRepository.save(service);
    }

    public void softDeleteService(UUID id) {
        SpaService service = getServiceById(id);
        service.setActive(false);
        serviceRepository.save(service);
    }
}
