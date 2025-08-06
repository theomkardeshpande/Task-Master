package com.example.demo.Dto;

import lombok.Data;

@Data
public class PasswordResetRequest {

    private String token;
    private String newPassword;
}
