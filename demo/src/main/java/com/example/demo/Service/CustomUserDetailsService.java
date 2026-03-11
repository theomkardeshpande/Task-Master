package com.example.demo.Service;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.CustomUserDetails;
import com.example.demo.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo userRepository;

    // CustomUserDetailsService.java — ✅ Cleaner approach
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No account found."));

        // ✅ Just return the user — Spring checks isEnabled() automatically
        return new CustomUserDetails(user);
    }
}


