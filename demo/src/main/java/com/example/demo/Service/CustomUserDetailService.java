package com.example.demo.Service;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Repository.UserRepo;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepo userRepo;

    public CustomUserDetailService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public CustomUserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // AppUser user = userRepo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("USER NOT FOUND..!"));
        Optional<AppUser> user=userRepo.findByEmail(email);
        try {
            if(user.isEmpty()){
                throw new UsernameNotFoundException("USER NOT FOUND..!");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new CustomUserDetails(user.get());
    }
}
