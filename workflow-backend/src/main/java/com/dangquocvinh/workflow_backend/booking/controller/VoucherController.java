package com.dangquocvinh.workflow_backend.booking.controller;

import com.dangquocvinh.workflow_backend.booking.entity.Voucher;
import com.dangquocvinh.workflow_backend.booking.repository.VoucherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    private final VoucherRepository voucherRepository;

    public VoucherController(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @GetMapping
    public ResponseEntity<List<Voucher>> getAll() {
        return ResponseEntity.ok(voucherRepository.findAll());
    }

    @GetMapping("/{code}")
    public ResponseEntity<Voucher> getByCode(@PathVariable String code) {
        Optional<Voucher> voucher = voucherRepository.findByCode(code);
        return voucher.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Voucher> create(@RequestBody Voucher voucher) {
        return ResponseEntity.ok(voucherRepository.save(voucher));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Voucher> update(@PathVariable UUID id, @RequestBody Voucher input) {
        Voucher existing = voucherRepository.findById(id).orElseThrow();
        if (input.getCode() != null) existing.setCode(input.getCode());
        if (input.getDiscountPercent() != null) existing.setDiscountPercent(input.getDiscountPercent());
        if (input.getMaxDiscountAmount() != null) existing.setMaxDiscountAmount(input.getMaxDiscountAmount());
        if (input.getMinOrderValue() != null) existing.setMinOrderValue(input.getMinOrderValue());
        if (input.getStartDate() != null) existing.setStartDate(input.getStartDate());
        if (input.getEndDate() != null) existing.setEndDate(input.getEndDate());
        if (input.getUsageLimit() != null) existing.setUsageLimit(input.getUsageLimit());
        if (input.getActive() != null) existing.setActive(input.getActive());
        
        return ResponseEntity.ok(voucherRepository.save(existing));
    }
}
