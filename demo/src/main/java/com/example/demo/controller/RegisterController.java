package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.service.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class RegisterController {
    private final UserService userService;
    
    public RegisterController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserResponse user = userService.registerNewUser(request);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse(ex.getMessage()));
        }
    }
}

class ErrorResponse {
    private String message;
    public ErrorResponse(String message) { this.message = message; }
    public String getMessage() { return message; }
}
