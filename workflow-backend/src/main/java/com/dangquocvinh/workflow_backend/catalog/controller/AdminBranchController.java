package com.dangquocvinh.workflow_backend.catalog.controller;

import com.dangquocvinh.workflow_backend.catalog.entity.Branch;
import com.dangquocvinh.workflow_backend.catalog.repository.BranchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/branches")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class AdminBranchController {

    private final BranchRepository branchRepository;

    public AdminBranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @PostMapping
    public ResponseEntity<Branch> create(@RequestBody Branch branch) {
        if (branch.getId() == null) branch.setId(UUID.randomUUID());
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Branch> update(@PathVariable UUID id, @RequestBody Branch branch) {
        Branch existing = branchRepository.findById(id).orElseThrow();
        existing.setName(branch.getName());
        existing.setOpeningTime(branch.getOpeningTime());
        existing.setClosingTime(branch.getClosingTime());
        existing.setAddress(branch.getAddress());
        return ResponseEntity.ok(branchRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        branchRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
