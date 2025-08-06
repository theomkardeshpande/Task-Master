package com.example.demo.Service;

import com.example.demo.Repository.UserRepo;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.demo.Dto.UserResponse;
import com.example.demo.Model.AppUser;
import com.example.demo.Dto.RegisterRequest;

@Service
public class UserService {
    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepo repo, PasswordEncoder enc) {
        this.userRepository = repo;
        this.passwordEncoder = enc;
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
                user.getFullname(),
                user.getEmail(),
                user.getRegisterationTime()
        );
    }
}
