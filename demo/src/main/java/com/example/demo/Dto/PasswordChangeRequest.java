package com.example.demo.Dto;

import lombok.Data;

@Data
public class PasswordChangeRequest {

    private String currentPassword;
    private String newPassword;
    private String confirmNewPassword;
}
