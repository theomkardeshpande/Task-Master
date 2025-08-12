package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.AppUser;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.repository.UserRepo;
import com.example.demo.security.JwtUtil;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService {
    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;


    public UserService(UserRepo repo, PasswordEncoder enc, JwtUtil jwtUtil) {
        this.userRepository = repo;
        this.passwordEncoder = enc;
        this.jwtUtil = jwtUtil;
    }

    public UserResponse registerNewUser(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        AppUser user = new AppUser();
        user.setRole("USER");
        user.setFullname(req.getFullname());
        user.setEmail(req.getEmail());
        user.setRegisterationTime(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode(req.getPassword())); // hash password!
        userRepository.save(user);

        return new UserResponse(
                user.getUser_id(),
                user.getFullname(),
                user.getEmail(),
                user.getRegisterationTime()
        );
    }

    public void changePassword(int id, PasswordChangeRequest request) {

        try {
            AppUser user = userRepository.findById(id);
            if (user == null) {
                throw new RuntimeException("User not Found");
            }

            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new RuntimeException("Current Password is Incorrect");
            }

            if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
                throw new RuntimeException("New Password and Confirm Password do not Match");
            }

            String hashedPassword = passwordEncoder.encode(request.getNewPassword());
            user.setPassword(hashedPassword);

            userRepository.save(user);

        } catch (Exception e) {
            System.out.println(e.toString());
        }

    }

    public UpdatedProfileResponse updatedProfileResponse(int user_id, ProfileChangeRequest request) {
        AppUser updatedUser = userRepository.findById(user_id);

        if(updatedUser==null){
            throw new RuntimeException("Updated User Not Found"+user_id);
        }

        updatedUser.setFullname(request.getFullname());
        updatedUser.setBio(request.getBio());
        updatedUser.setEmail(request.getEmail());

        userRepository.save(updatedUser);
        updateAuthenticatedPrincipal(updatedUser);
        CustomUserDetails userDetails = new CustomUserDetails(updatedUser);

        String newjwt = jwtUtil.generateToken(userDetails);

        return new UpdatedProfileResponse(updatedUser, newjwt);
    }

    public void updateAuthenticatedPrincipal(AppUser updatedUser) {
        Authentication currentAuth = SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails updatedDetails = new CustomUserDetails(updatedUser);

        Authentication newAuth = new UsernamePasswordAuthenticationToken(
                currentAuth != null ? currentAuth.getCredentials() : null,
                updatedDetails.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(newAuth);
    }
}
