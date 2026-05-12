package com.dangquocvinh.workflow_backend.catalog.controller;

import com.dangquocvinh.workflow_backend.catalog.entity.Branch;
import com.dangquocvinh.workflow_backend.catalog.repository.BranchRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchRepository branchRepository;

    public BranchController(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    @GetMapping
    public ResponseEntity<List<Branch>> getAllBranches() {
        return ResponseEntity.ok(branchRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Branch> create(@RequestBody Branch branch) {
        return ResponseEntity.ok(branchRepository.save(branch));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Branch> update(@PathVariable UUID id, @RequestBody Branch branch) {
        Branch existing = branchRepository.findById(id).orElseThrow();
        existing.setName(branch.getName());
        existing.setOpeningTime(branch.getOpeningTime());
        existing.setClosingTime(branch.getClosingTime());
        return ResponseEntity.ok(branchRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        branchRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
