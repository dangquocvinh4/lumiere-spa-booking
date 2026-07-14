package com.dangquocvinh.workflow_backend.upload.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private static final String UPLOAD_DIR = "./uploads/";
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final List<String> ALLOWED_MIME_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Không tìm thấy file tải lên."
            ));
        }

        // Validate File Size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "File quá lớn! Dung lượng tối đa được phép là 5MB."
            ));
        }

        // Validate Content Type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Định dạng file không hợp lệ! Hệ thống chỉ hỗ trợ ảnh JPEG, PNG và WEBP."
            ));
        }

        try {
            // Create uploads folder if not exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate clean unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                // Default fallback extensions based on mime type
                if ("image/png".equals(contentType)) extension = ".png";
                else if ("image/webp".equals(contentType)) extension = ".webp";
                else extension = ".jpg";
            }
            
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            Path targetLocation = uploadPath.resolve(uniqueFilename);

            // Copy file to physical location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative file path
            String relativeUrl = "/uploads/" + uniqueFilename;
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tải ảnh lên thành công",
                "data", Map.of("url", relativeUrl)
            ));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Lỗi xảy ra trong quá trình lưu trữ file: " + e.getMessage()
            ));
        }
    }
}
