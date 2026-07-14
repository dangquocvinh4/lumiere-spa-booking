package com.dangquocvinh.workflow_backend.user.controller;

import com.dangquocvinh.workflow_backend.user.entity.RoleName;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.dangquocvinh.workflow_backend.user.entity.Role;
import com.dangquocvinh.workflow_backend.user.repository.RoleRepository;
import java.util.HashSet;
import java.util.Collections;
import java.util.UUID;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/customers")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'RECEPTIONIST')")
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final javax.sql.DataSource dataSource;

    public AdminUserController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, javax.sql.DataSource dataSource) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
    }

    @GetMapping("/")
    public ResponseEntity<?> getCustomers(@RequestParam(required = false) RoleName role) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByRolesName(role);
        } else {
            users = userRepository.findAll();
        }
        
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", u.getId());
            map.put("email", u.getEmail());
            map.put("fullName", u.getFullName());
            map.put("phone", u.getPhone() != null ? u.getPhone() : "");
            map.put("createdAt", u.getCreatedAt().toString());
            map.put("loyaltyPoints", u.getLoyaltyPoints() != null ? u.getLoyaltyPoints() : 0);
            
            // Get first role name
            String roleName = u.getRoles().stream()
                    .map(r -> r.getName().name())
                    .findFirst()
                    .orElse("ROLE_CUSTOMER");
            map.put("role", roleName);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @PostMapping("/")
    public ResponseEntity<?> addCustomer(@RequestBody Map<String, String> body) {
        String phone = body.get("phone");
        String fullName = body.get("fullName");
        String email = body.get("email");
        String roleStr = body.getOrDefault("role", "ROLE_CUSTOMER");
        
        // Generate phone-based email if not provided
        if (email == null || email.trim().isEmpty()) {
            email = phone + "@spa.local";
        }

        if (userRepository.findFirstByPhone(phone).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Số điện thoại đã tồn tại"));
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email đã tồn tại"));
        }

        User newUser = new User();
        newUser.setPhone(phone);
        newUser.setFullName(fullName);
        newUser.setEmail(email);
        
        String password = body.get("password");
        if (password == null || password.trim().isEmpty()) {
            password = "default123";
        }
        newUser.setPassword(passwordEncoder.encode(password));

        RoleName roleNameEnum = RoleName.valueOf(roleStr);
        Role role = roleRepository.findByName(roleNameEnum)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        newUser.setRoles(new HashSet<>(Collections.singletonList(role)));

        User saved = userRepository.save(newUser);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", saved.getId());
        result.put("email", saved.getEmail());
        result.put("fullName", saved.getFullName());
        result.put("phone", saved.getPhone());
        result.put("createdAt", saved.getCreatedAt().toString());
        result.put("role", roleStr);

        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        if (body.containsKey("fullName") && body.get("fullName") != null) {
            user.setFullName(body.get("fullName"));
        }
        if (body.containsKey("phone") && body.get("phone") != null) {
            String newPhone = body.get("phone");
            var existing = userRepository.findFirstByPhone(newPhone);
            if (existing.isPresent() && !existing.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Số điện thoại đã được sử dụng"));
            }
            user.setPhone(newPhone);
        }
        if (body.containsKey("email") && body.get("email") != null) {
            String newEmail = body.get("email");
            var existingEmail = userRepository.findByEmail(newEmail);
            if (existingEmail.isPresent() && !existingEmail.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email đã được sử dụng"));
            }
            user.setEmail(newEmail);
        }
        if (body.containsKey("role") && body.get("role") != null) {
            String roleStr = body.get("role");
            RoleName roleNameEnum = RoleName.valueOf(roleStr);
            Role role = roleRepository.findByName(roleNameEnum)
                    .orElseThrow(() -> new RuntimeException("Role not found"));
            user.setRoles(new HashSet<>(Collections.singletonList(role)));
        }
        if (body.containsKey("password") && body.get("password") != null && !body.get("password").trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(body.get("password")));
        }

        User saved = userRepository.save(user);

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("id", saved.getId());
        result.put("email", saved.getEmail());
        result.put("fullName", saved.getFullName());
        result.put("phone", saved.getPhone() != null ? saved.getPhone() : "");
        result.put("createdAt", saved.getCreatedAt().toString());
        result.put("role", saved.getRoles().stream().map(r -> r.getName().name()).findFirst().orElse("ROLE_CUSTOMER"));

        return ResponseEntity.ok(Map.of("success", true, "data", result));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<?> deleteCustomer(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        try {
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa người dùng"));
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Không thể xóa người dùng vì họ đã có lịch sử đặt lịch hẹn (ràng buộc dữ liệu)."));
        }
    }

    @GetMapping("/fix-db")
    public ResponseEntity<?> fixDb() {
        try (java.sql.Connection conn = dataSource.getConnection();
             java.sql.Statement stmt = conn.createStatement()) {
            stmt.execute("ALTER TABLE appointments MODIFY COLUMN payment_status VARCHAR(50) NULL");
            return ResponseEntity.ok(Map.of("success", true, "message", "Database altered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
