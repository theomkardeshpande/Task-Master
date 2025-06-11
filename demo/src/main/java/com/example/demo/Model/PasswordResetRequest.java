package com.example.demo.Model;

import lombok.Data;

@Data
public class PasswordResetRequest {

    private String token;
    private String newPassword;
}
