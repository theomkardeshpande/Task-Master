package com.example.demo.Service;

import com.example.demo.Dto.PasswordChangeRequest;
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

    public void changePassword(int id, PasswordChangeRequest request){

        try{
            AppUser user = userRepository.findById(id);
            if(user==null){
                throw new RuntimeException("User not Found");
            }

            if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())){
                throw new RuntimeException("Current Password is Incorrect");
            }

            if(!request.getNewPassword().equals(request.getConfirmNewPassword())){
                throw new RuntimeException("New Password and Confirm Password do not Match");
            }

            String hashedPassword=passwordEncoder.encode(request.getNewPassword());
            user.setPassword(hashedPassword);

            userRepository.save(user);

        }catch (Exception e){
            System.out.println(e.toString());
        }

    }
}
