package com.example.demo.controller;

import com.example.demo.dto.UserProfileData;
import com.example.demo.model.AppUser;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.repository.UserRepo;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserProfileController {

    private final UserRepo userRepository;

    public UserProfileController(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    ResponseEntity<?> getUserProfile(@AuthenticationPrincipal CustomUserDetails customUserDetails) {
        AppUser user = userRepository.findById(customUserDetails.getUserId());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UserProfileData savedUser = new UserProfileData();
        savedUser.setProfilePicture(user.getProfilePicture());
        savedUser.setId(user.getUser_id());
        savedUser.setEmail(user.getEmail());
        savedUser.setRole(user.getRole());
        savedUser.setBio(user.getBio());
        savedUser.setFullname(user.getFullname());

        return ResponseEntity.ok(savedUser);

    }
}
