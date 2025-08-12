package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private int user_id;
    private String email;
    private String name;
    private LocalDateTime loginTime;
    private String token;

    public LoginResponse(String token){
        this.token=token;
    }
}



