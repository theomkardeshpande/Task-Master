package com.example.demo.service;

import com.example.demo.model.AppUser;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.repository.UserRepo;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailService implements UserDetailsService {

    private final UserRepo userRepo;

    public CustomUserDetailService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    public CustomUserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("USER NOT FOUND..! Email: " + email));

        return new CustomUserDetails(user);
    }

    public CustomUserDetails loadUserById(int id) throws Exception{
        AppUser user=userRepo.findById(id);
        if(user==null){
            throw new UsernameNotFoundException("USER NOT FOUND"+id);
        }
        return new CustomUserDetails(user);
    }
}
