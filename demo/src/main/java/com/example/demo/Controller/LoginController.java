package com.example.demo.Controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Security.JwtUtil;
import com.example.demo.Dto.LoginRequest;
import com.example.demo.Dto.LoginResponse;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(), loginRequest.getPassword()
                )
            );
            // Optionally, generate JWT or HttpSession here
            String token=jwtUtil.generateToken(loginRequest.getEmail());
            // Return minimal, safe user info
            LoginResponse response=new LoginResponse(token);
            response.setEmail(loginRequest.getEmail());
            response.setLoginTime(LocalDateTime.now());
            response.setName(authentication.getName());
            
            return ResponseEntity.ok(response);
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // No backend state to clear with stateless JWT
        return ResponseEntity.ok("Logged out (client should delete JWT)");
    }
}
