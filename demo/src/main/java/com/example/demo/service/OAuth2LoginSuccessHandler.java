package com.example.demo.service;


import com.example.demo.model.AppUser;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.repository.UserRepo;
import com.example.demo.security.JwtUtil;
import io.jsonwebtoken.io.IOException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepo userRepository;
    private final CustomUserDetailService userDetailsService;

    public OAuth2LoginSuccessHandler(JwtUtil jwtUtil, UserRepo userRepository, CustomUserDetailService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.userDetailsService = userDetailsService;
    }

    public String generateDefaultPasswordForOAuthUser() {
        String randomPwd = UUID.randomUUID().toString();  // Generate a random UUID
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(randomPwd);  // Store its hashed form
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, java.io.IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");
        String Fullname = oauthUser.getAttribute("name");

        // Optional: double-check user exists
        Optional<AppUser> userForId = userRepository.findByEmail(email);

        AppUser user = userForId.orElseThrow(() -> new RuntimeException("User Not Found in Oauth"));
        CustomUserDetails userDetails = null;
        try {
            userDetails = new CustomUserDetailService(userRepository).loadUserById(user.getUser_id());
        } catch (Exception e) {
            throw new RuntimeException(e + "IN OAUTH2");
        }
        CustomUserDetails customUserDetails = new CustomUserDetails(user);
        System.out.println(userDetails.getUserId());

        // Generate JWT token
        String token = jwtUtil.generateToken(customUserDetails);

        // Set token as HttpOnly cookie or in response header as preferred
        Cookie jwtCookie = new Cookie("jwt_token", token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true); // Only if using HTTPS in prods
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(60 * 60); // 1 hour expiry
        response.addCookie(jwtCookie);

        // Manually set authentication in SecurityContext
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authToken);
        // Redirect to dashboard or any frontend route
        getRedirectStrategy().sendRedirect(request, response, "/dashboard");
    }
}