package com.example.demo.controller;

import java.time.LocalDateTime;

import com.example.demo.model.CustomUserDetails;
import com.example.demo.security.JwtUtil;
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

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getPassword()
                    )
            );

            // Extract CustomUserDetails from authentication object
            CustomUserDetails newuserDetails = (CustomUserDetails) authentication.getPrincipal();
            System.out.println(newuserDetails.getUserId()+"FROM LOGIN CONTROLLER");
            Object principal = authentication.getPrincipal();
            CustomUserDetails userDetails=null;
            if (principal instanceof CustomUserDetails) {
                userDetails = (CustomUserDetails) principal;
                System.out.println("FROM LOGIN CONTROLLER"+userDetails.getUserId());
                // your logic
            } else {
                // fallback or throw error
                throw new IllegalStateException("Expected CustomUserDetails principal but got " + principal.getClass());
            }

            int userId = userDetails.getUserId();
            String name = userDetails.getFullname();

            // Generate JWT token with user details
            String token = jwtUtil.generateToken(userDetails);

            // Prepare LoginResponse DTO
            LoginResponse response = new LoginResponse(token);
            response.setUser_id(userId);
            response.setEmail(userDetails.getUsername()); // Always from DB, not request
            response.setLoginTime(LocalDateTime.now());
            response.setName(name != null ? name : userDetails.getUsername());

            return ResponseEntity.ok(response);

        } catch (AuthenticationException ex) {
            // Return 401 Unauthorized on bad credentials
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // JWT is stateless: client must delete the token
        return ResponseEntity.ok("Logged out (client should delete JWT)");
    }
}
