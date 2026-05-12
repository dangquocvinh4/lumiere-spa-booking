package com.dangquocvinh.workflow_backend.staff.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "working_schedules")
public class WorkingSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    @Column(name = "day_of_week", nullable = false)
    private Integer dayOfWeek; // 2 to 8 (Monday to Sunday)

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;
}
