package com.dangquocvinh.workflow_backend.booking.repository;

import com.dangquocvinh.workflow_backend.booking.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface VoucherRepository extends JpaRepository<Voucher, UUID> {
    Optional<Voucher> findByCode(String code);
}
