package com.dangquocvinh.workflow_backend.payment.controller;

import com.dangquocvinh.workflow_backend.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/create-url")
    public ResponseEntity<Map<String, String>> createPaymentUrl(@RequestParam UUID appointmentId, HttpServletRequest request) {
        String paymentUrl = paymentService.createPaymentUrl(appointmentId, request);
        return ResponseEntity.ok(Map.of("url", paymentUrl));
    }

    @GetMapping("/verify-vnpay")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestParam Map<String, String> allParams) {
        Map<String, Object> result = paymentService.verifyPayment(allParams);
        return ResponseEntity.ok(result);
    }
}
