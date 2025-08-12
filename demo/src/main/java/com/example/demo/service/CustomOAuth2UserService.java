package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.example.demo.model.AppUser;
import com.example.demo.repository.UserRepo;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepo userRepository;

    public CustomOAuth2UserService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    public String generateDefaultPasswordForOAuthUser() {
        String randomPwd = UUID.randomUUID().toString();  // Generate a random UUID
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(randomPwd);  // Store its hashed form

    }
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String fullName = oauth2User.getAttribute("name");

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        // Save or update user in database
        Optional<AppUser> userOptional = userRepository.findByEmail(email);
        AppUser user;
        if (userOptional.isPresent()) {
            user = userOptional.get();
            user.setFullname(fullName); // update name in case changed
        } else {
            user = new AppUser();
            user.setEmail(email);
            user.setFullname(fullName);
            user.setRole("USER");
            user.setPassword(generateDefaultPasswordForOAuthUser());
            user.setRegisterationTime(LocalDateTime.now());
            // Set default role etc.
        }
        userRepository.save(user);

        return oauth2User; // Proceed with default OAuth2User implementation for Spring Security
    }
}
