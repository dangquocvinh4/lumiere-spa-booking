package com.dangquocvinh.workflow_backend.catalog.controller;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.catalog.entity.Review;
import com.dangquocvinh.workflow_backend.catalog.repository.ReviewRepository;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    public ReviewController(ReviewRepository reviewRepository, 
                            AppointmentRepository appointmentRepository,
                            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Không tìm thấy user"));

        UUID appointmentId = UUID.fromString(request.get("appointmentId").toString());
        UUID serviceId = UUID.fromString(request.get("serviceId").toString());
        int rating = Integer.parseInt(request.get("rating").toString());
        String comment = request.containsKey("comment") ? request.get("comment").toString() : null;
        UUID staffId = request.containsKey("staffId") && request.get("staffId") != null ? UUID.fromString(request.get("staffId").toString()) : null;

        Appointment appointment = appointmentRepository.findById(appointmentId).orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn"));
        
        if (!appointment.getCustomerId().equals(user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Bạn không có quyền đánh giá lịch hẹn này"));
        }
        
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Chỉ có thể đánh giá lịch hẹn đã hoàn thành"));
        }

        if (reviewRepository.existsByAppointmentIdAndCustomerId(appointmentId, user.getId())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Bạn đã đánh giá lịch hẹn này rồi"));
        }

        Review review = new Review();
        review.setAppointmentId(appointmentId);
        review.setCustomerId(user.getId());
        review.setServiceId(serviceId);
        if (staffId != null) {
            review.setStaffId(staffId);
        } else if (appointment.getStaffId() != null) {
            review.setStaffId(appointment.getStaffId());
        }
        review.setRating(rating);
        review.setComment(comment);
        
        reviewRepository.save(review);

        return ResponseEntity.ok(Map.of("success", true, "message", "Đánh giá thành công"));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<?> getServiceReviews(@PathVariable UUID serviceId) {
        List<Review> reviews = reviewRepository.findByServiceIdOrderByCreatedAtDesc(serviceId);
        
        List<Map<String, Object>> result = reviews.stream().map(r -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", r.getId());
            map.put("rating", r.getRating());
            map.put("comment", r.getComment() != null ? r.getComment() : "");
            map.put("createdAt", r.getCreatedAt().toString());
            map.put("customerName", r.getCustomer() != null ? r.getCustomer().getFullName() : "Khách hàng");
            if (r.getStaff() != null && r.getStaff().getUser() != null) {
                map.put("staffName", r.getStaff().getUser().getFullName());
            }
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }
}
