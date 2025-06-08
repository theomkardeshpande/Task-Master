package com.example.demo.Controller;


import com.example.demo.Model.CustomUserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/user")
public class UserProfileController {

    @GetMapping("/profile")
    ResponseEntity<Map<String, String>> getUserProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Map<String, String> userData = new HashMap<>();
        userData.put("fullname", userDetails.getFullname());
        userData.put("email", userDetails.getUsername());
        return ResponseEntity.ok(userData);
    }
}
