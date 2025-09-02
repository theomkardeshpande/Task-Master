package com.example.demo.controller;

import com.example.demo.dto.PasswordChangeRequest;
import com.example.demo.dto.PasswordChangeResponse;
import com.example.demo.service.UserService;
import com.example.demo.security.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserSecurityController {

    private final UserService userSecurityService;
    private final JwtUtil jwtUtil;

    public UserSecurityController(UserService userSecurityService, JwtUtil jwtUtil) {
        this.userSecurityService = userSecurityService;
        this.jwtUtil = jwtUtil;
    }

    @PutMapping("/change-password")
    public ResponseEntity<PasswordChangeResponse> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            HttpServletRequest httpRequest) {

        try {
            String token = extractTokenFromRequest(httpRequest);
            int userId = jwtUtil.getUserIdFromToken(token);

            userSecurityService.changePassword(userId, request);

            return ResponseEntity.ok(new PasswordChangeResponse(true, "Password changed successfully"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(new PasswordChangeResponse(false, e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(401)
                    .body(new PasswordChangeResponse(false, "Current password is incorrect"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new PasswordChangeResponse(false, "Failed to change password"));
        }
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<PasswordChangeResponse> deleteAccount(HttpServletRequest httpRequest) {
        try {
            String token = extractTokenFromRequest(httpRequest);
            int userId = jwtUtil.getUserIdFromToken(token);

            userSecurityService.deleteAccount(userId);

            return ResponseEntity.ok(new PasswordChangeResponse(true, "Account deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new PasswordChangeResponse(false, "Failed to delete account"));
        }
    }

    @GetMapping("/export-data")
    public ResponseEntity<Resource> exportUserData(HttpServletRequest httpRequest) {
        try {
            String token = extractTokenFromRequest(httpRequest);
            int userId = jwtUtil.getUserIdFromToken(token);

            Resource dataFile = userSecurityService.exportUserData(userId);

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"taskmaster-data.json\"")
                    .body(dataFile);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt_token".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    if (token != null && !token.trim().isEmpty()) {
                        // Optional: URL decode if needed
                        try {
                            return java.net.URLDecoder.decode(token, StandardCharsets.UTF_8);
                        } catch (Exception e) {
                            return token; // Return original if decoding fails
                        }
                    }
                }
            }
        }
        throw new IllegalArgumentException("JWT token not found in cookies");
    }


}
