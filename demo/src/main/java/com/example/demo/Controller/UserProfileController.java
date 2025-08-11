package com.example.demo.Controller;


import com.example.demo.Dto.UserProfileData;
import com.example.demo.Model.AppUser;
import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Repository.UserRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/user")
public class UserProfileController {

    private final UserRepo userRepository;

    public UserProfileController(UserRepo userRepository){
        this.userRepository=userRepository;
    }

//    @GetMapping("/authorized")
//    ResponseEntity<UserProfileData> getAuthorizedUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
//        if (userDetails == null) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
//        }
//        UserProfileData userData=new UserProfileData();
//        userData.setFullname(userDetails.getFullname());
//        userData.setId(userDetails.getUserId());
//        userData.setBio(userDetails.getBio());
//        userData.setEmail(userDetails.getUsername());
//
//        return ResponseEntity.ok(userData);
//    }

    @GetMapping("/profile")
    ResponseEntity<?> getUserProfile(@AuthenticationPrincipal CustomUserDetails customUserDetails){
        AppUser user=userRepository.findById(customUserDetails.getUserId());
        if(user==null){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }else {
            UserProfileData savedUser=new UserProfileData();
            savedUser.setProfilePicture(user.getProfilePicture());
            savedUser.setId(user.getUser_id());
            savedUser.setEmail(user.getEmail());
            savedUser.setBio(user.getBio());
            savedUser.setFullname(user.getFullname());

            return ResponseEntity.ok(savedUser);
        }
    }

}
