package com.example.demo.Service;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    public void saveUser(AppUser user) {
        userRepo.save(user);
        System.out.println("Saving user: " + user);
    }

    public Optional<AppUser> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }
}
