package com.dangquocvinh.workflow_backend.auth.controller;

import com.dangquocvinh.workflow_backend.security.jwt.JwtService;
import com.dangquocvinh.workflow_backend.user.entity.Role;
import com.dangquocvinh.workflow_backend.user.entity.RoleName;
import com.dangquocvinh.workflow_backend.user.entity.User;
import com.dangquocvinh.workflow_backend.user.repository.RoleRepository;
import com.dangquocvinh.workflow_backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, UserRepository userRepository,
                          RoleRepository roleRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.get("email"), loginRequest.get("password")));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtService.generateJwtToken(authentication);

        User user = userRepository.findByEmail(loginRequest.get("email")).orElseThrow();
        Map<String, Object> userData = Map.of(
            "id", user.getId(),
            "email", user.getEmail(),
            "fullName", user.getFullName(),
            "roles", user.getRoles().stream().map(r -> r.getName().toString()).toList()
        );

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đăng nhập thành công",
            "data", Map.of(
                "token", jwt,
                "user", userData
            )
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.get("email"))) {
            return ResponseEntity.badRequest().body("Lỗi: Email đã được sử dụng!");
        }

        User user = new User();
        user.setEmail(signUpRequest.get("email"));
        user.setPassword(passwordEncoder.encode(signUpRequest.get("password")));
        user.setFullName(signUpRequest.get("fullName"));
        user.setPhone(signUpRequest.get("phone"));

        Role userRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Lỗi: Không tìm thấy Role."));
        user.setRoles(Set.of(userRole));

        userRepository.save(user);

        return ResponseEntity.ok("Đăng ký tài khoản thành công!");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(authentication.getPrincipal());
    }
}
