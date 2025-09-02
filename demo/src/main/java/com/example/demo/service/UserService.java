package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.AppUser;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepo;
import com.example.demo.repository.UserRepo;
import com.example.demo.security.JwtUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;


@Service
public class UserService {
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final TaskRepo taskRepo;
    private final ObjectMapper objectMapper;

    public UserService(UserRepo repo, PasswordEncoder enc, JwtUtil jwtUtil, TaskRepo taskRepo, ObjectMapper objectMapper) {
        this.userRepository = repo;
        this.passwordEncoder = enc;
        this.jwtUtil = jwtUtil;
        this.taskRepo = taskRepo;
        this.objectMapper = objectMapper;
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

    public UpdatedProfileResponse updatedProfileResponse(int user_id, ProfileChangeRequest request) {
        AppUser updatedUser = userRepository.findById(user_id);

        if (updatedUser == null) {
            throw new RuntimeException("Updated User Not Found" + user_id);
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

    @Transactional
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

            updateAuthenticatedPrincipal(user);

        } catch (Exception e) {
            System.out.println(e.toString());
        }

    }

    @Transactional
    public void deleteAccount(int userId) {
        AppUser user = userRepository.findById(userId);

        if (user == null) {
            throw new IllegalArgumentException("User Not Found..!");
        }

        taskRepo.deleteByUserEmail(user.getEmail());
        userRepository.delete(user);
    }

    public Resource exportUserData(int userId) throws Exception {
        AppUser user = userRepository.findById(userId);

        if (user == null) {
            throw new IllegalArgumentException("User not Found..!");
        }

        List<Task> userTasks = taskRepo.findByUserEmailOrderByCreatedDateDesc(user.getEmail());

        // Create export data structure
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("exportDate", java.time.LocalDateTime.now().toString());
        exportData.put("user", createUserExportData(user));
        exportData.put("tasks", userTasks);

        // Convert to JSON
        String jsonData = objectMapper.writeValueAsString(exportData);
        return new ByteArrayResource(jsonData.getBytes());
    }

    private void validatePasswordChangeRequest(PasswordChangeRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        if (!PASSWORD_PATTERN.matcher(request.getNewPassword()).matches()) {
            throw new IllegalArgumentException(
                    "Password must be at least 8 characters long and contain at least one uppercase letter, " +
                            "one lowercase letter, one digit, and one special character"
            );
        }
    }

    private Map<String, Object> createUserExportData(AppUser user) {
        Map<String, Object> userData = new HashMap<>();
        userData.put("email", user.getEmail());
        userData.put("name", user.getFullname());
        userData.put("createdDate", user.getRegisterationTime());
        // Don't include password or other sensitive data
        return userData;
    }
}



