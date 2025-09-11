package com.example.demo.controller;

import com.example.demo.dto.UserProfileData;
import com.example.demo.model.AppUser;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.repository.UserRepo;

import com.example.demo.service.EmailVerificationService;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/user")
public class UserProfileController {

    private final UserRepo userRepository;
    private final EmailVerificationService emailVerificationService;
    public UserProfileController(UserRepo userRepository,EmailVerificationService emailVerificationService) {
        this.userRepository = userRepository;
        this.emailVerificationService=emailVerificationService;
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
        savedUser.setVerified(user.isVerified());
        savedUser.setFullname(user.getFullname());

        return ResponseEntity.ok(savedUser);

    }

    @GetMapping("/verify-email/send-code")
    ResponseEntity<String> verifyEmail(@AuthenticationPrincipal CustomUserDetails customUserDetails){
        AppUser user=userRepository.findById(customUserDetails.getUserId());
        if(user==null){
            return ResponseEntity.badRequest().body("User Not Found");
        }
        String send=emailVerificationService.sendCode(user);
        return ResponseEntity.ok(send);
    }

    @PostMapping(value = "/verify-email/confirm-code", consumes = "application/x-www-form-urlencoded")
    ResponseEntity<String> confirmCode(@RequestParam("code") String code, @AuthenticationPrincipal CustomUserDetails customUserDetails){
        AppUser user=userRepository.findById(customUserDetails.getUserId());
        System.out.println("CODE:"+code);
        if(user==null){
            return ResponseEntity.badRequest().build();
        }
        boolean verified= emailVerificationService.confirmCode(user,code.trim());
        System.out.println(verified);
        if(verified){
            return ResponseEntity.ok("Email is Verified");
        }
        return ResponseEntity.badRequest().body("Incorrect Code Entered");
    }
}
