package com.example.demo.dto;

import java.time.LocalDateTime;

import jakarta.servlet.http.Cookie;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LoginResponse {
    private int user_id;
    private String email;
    private String name;
    private String token;
    private LocalDateTime loginTime;
    private String role;

}



