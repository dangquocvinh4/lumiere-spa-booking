package com.dangquocvinh.workflow_backend.catalog.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ServiceDto {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationMinutes;
    private String imageUrl;
    private String category;
}
