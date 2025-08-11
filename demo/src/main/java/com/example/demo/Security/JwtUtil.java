package com.example.demo.Security;

import com.example.demo.Model.CustomUserDetails;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    // Load secret key from application properties in Base64 encoded form
    @Value("${JWT_SECRET}")
    private String secretKeyBase64;

    private Key key;
    private final long expirationMs = 86400000; // 1 day token validity

    // Initialize the Key object after loading the secret string
    @PostConstruct
    public void init() {
        byte[] decodedKey = Base64.getDecoder().decode(secretKeyBase64);
        this.key = Keys.hmacShaKeyFor(decodedKey);
    }

    // Generate token for user email
    public String generateToken(CustomUserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userDetails.getUserId());
        claims.put("email", userDetails.getUsername()); // Keep email as well if needed

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(String.valueOf(userDetails.getUserId()))  // Usually email/username
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Integer getUserIdFromToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("userId", Integer.class);  // Get custom claim as Integer
        } catch (Exception e) {
            // Log and handle invalid token
            System.err.println("Could not extract userId from token: " + e.getMessage());
            return null;
        }
    }


    // Get email (subject) from JWT token
    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // Validate token signature and expiration
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Log or handle invalid token here if needed
            System.out.println(e.getMessage()+"JWT TOKENS VALIDATE");
        }
        return false;
    }
}
