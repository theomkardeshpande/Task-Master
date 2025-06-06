package com.example.demo.Service;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Repository.UserRepo;
import org.springframework.security.core.userdetails.UserDetails;
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
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = userRepo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("USER NOT FOUND..!"));

        return new CustomUserDetails(user);
    }
}
