package com.example.ccedemo.controller;

import org.springframework.beans.factory.annotation.Value;
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
import java.util.*;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileController {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${file.mount.type:local}")
    private String mountType;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Please select a file to upload");
        }

        try {
            // Create upload directory if not exists
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;
            
            // Save file
            Path filePath = Paths.get(uploadDir, uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return file info
            Map<String, Object> response = new HashMap<>();
            response.put("filename", uniqueFilename);
            response.put("originalFilename", originalFilename);
            response.put("filePath", filePath.toString());
            response.put("fileSize", file.getSize());
            response.put("contentType", file.getContentType());
            response.put("mountType", mountType);
            response.put("uploadTime", new Date());

            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<Map<String, Object>>> listFiles() {
        try {
            File directory = new File(uploadDir);
            List<Map<String, Object>> files = new ArrayList<>();
            
            if (directory.exists() && directory.isDirectory()) {
                File[] fileList = directory.listFiles();
                if (fileList != null) {
                    for (File file : fileList) {
                        if (file.isFile()) {
                            Map<String, Object> fileInfo = new HashMap<>();
                            fileInfo.put("filename", file.getName());
                            fileInfo.put("filePath", file.getAbsolutePath());
                            fileInfo.put("fileSize", file.length());
                            fileInfo.put("lastModified", new Date(file.lastModified()));
                            fileInfo.put("mountType", mountType);
                            files.add(fileInfo);
                        }
                    }
                }
            }
            
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonList(Map.of("error", e.getMessage())));
        }
    }

    @GetMapping("/download/{filename}")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .header("Content-Type", "application/octet-stream")
                    .body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/delete/{filename}")
    public ResponseEntity<?> deleteFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir, filename);
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }
            
            Files.delete(filePath);
            return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete file: " + e.getMessage());
        }
    }

    @GetMapping("/mount-info")
    public ResponseEntity<Map<String, Object>> getMountInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("mountType", mountType);
        info.put("uploadDir", uploadDir);
        
        if ("local".equals(mountType)) {
            File directory = new File(uploadDir);
            info.put("absolutePath", directory.getAbsolutePath());
            info.put("exists", directory.exists());
            info.put("writable", directory.canWrite());
        } else if ("obs".equals(mountType)) {
            info.put("description", "Files are mounted via OBS (Object Storage Service)");
            info.put("bucket", System.getenv().getOrDefault("OBS_BUCKET", "cce-demo-files"));
            info.put("endpoint", System.getenv().getOrDefault("OBS_ENDPOINT", ""));
        }
        
        return ResponseEntity.ok(info);
    }
}
