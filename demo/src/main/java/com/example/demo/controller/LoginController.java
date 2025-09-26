package com.example.demo.controller;

import java.time.LocalDateTime;

import com.example.demo.model.CustomUserDetails;
import com.example.demo.security.JwtUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse res) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Extract CustomUserDetails from authentication object with safe casting
            Object principal = authentication.getPrincipal();
            if (!(principal instanceof CustomUserDetails)) {
                throw new IllegalStateException("Expected CustomUserDetails principal but got " + principal.getClass());
            }
            
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            
            // Log successful authentication (without sensitive data)
            System.out.println("User authenticated successfully: " + userDetails.getUsername());
            System.out.println("User ID: " + userDetails.getUserId());

            int userId = userDetails.getUserId();

            // Generate JWT token with user details
            String token = jwtUtil.generateToken(userDetails);

            Cookie jwtCookie = new Cookie("jwt_token", token);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setSecure(true); // Only if using HTTPS in prods
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(60 * 60); // 1 hour expiry
            res.addCookie(jwtCookie);
            
            // Prepare LoginResponse DTO
            LoginResponse response = new LoginResponse();
            response.setUser_id(userId);
            response.setEmail(userDetails.getUsername()); // Always from DB, not request
            response.setLoginTime(LocalDateTime.now());
            response.setToken(token);
            response.setRole(userDetails.getRole());
            response.setName(userDetails.getFullname());
            
            System.out.println("RESPONSE"+response.getUser_id()+" "+response.getName());
            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            // Log authentication failure (without sensitive data)
            System.out.println("Authentication failed for email: " + loginRequest.getEmail());
            
            // Return 401 Unauthorized with error message
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid credentials");
            errorResponse.put("message", "The email or password you entered is incorrect");
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            
        } catch (Exception ex) {
            // Handle any other unexpected errors
            System.err.println("Unexpected error during login: " + ex.getMessage());
            
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "An unexpected error occurred. Please try again later.");
            errorResponse.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT is stateless: client must delete the token
        final Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        response.put("instruction", "Please delete the JWT token from client storage");
        response.put("timestamp", LocalDateTime.now().toString());
        
        return ResponseEntity.ok(response);
    }
}
