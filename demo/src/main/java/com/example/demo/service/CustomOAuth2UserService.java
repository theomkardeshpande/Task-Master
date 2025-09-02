package com.example.demo.service;

import com.example.demo.model.AppUser;
import com.example.demo.repository.UserRepo;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepo userRepository;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    public CustomOAuth2UserService(UserRepo userRepository ) {
        this.userRepository = userRepository;
    }

    public String generateDefaultPasswordForOAuthUser() {
        String randomPwd = UUID.randomUUID().toString();  // Generate a random UUID
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(randomPwd);  // Store its hashed form

    }

    private byte[] downloadBytesWithJdk(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "image/*,*/*")
                    .GET()
                    .build();

            HttpResponse<byte[]> resp = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (resp.statusCode() >= 200 && resp.statusCode() < 300) {
                return resp.body();
            }
        } catch (Exception e) {
            // log
        }
        return null;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
//        OAuth2User oauth2User = super.loadUser(userRequest);
//        CustomOAuth2User oauth2User = (CustomOAuth2User) super.loadUser(userRequest);
        OAuth2User oauth2User = super.loadUser(userRequest);
        String email = oauth2User.getAttribute("email");
        String fullName = oauth2User.getAttribute("name");
        String profile_picture = oauth2User.getAttribute("picture");
        byte[] picture = null;

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not found from OAuth2 provider");
        }

        if (profile_picture.isEmpty()) {
            System.out.println("profile picture Not Found");
        } else {
            picture = downloadBytesWithJdk(profile_picture);
            System.out.println("PICTURE:" + Arrays.toString(picture));
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
            user.setProfilePicture(picture);
            user.setRole("GOOGLE");
            user.setPassword(generateDefaultPasswordForOAuthUser());
            user.setRegisterationTime(LocalDateTime.now());

            // Set default role etc.
        }
        userRepository.save(user);
        return oauth2User; // Proceed with default OAuth2User implementation for Spring Security
    }
}
