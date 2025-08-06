package com.example.demo.Dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    private String email;

    @Size(min = 3, message = "Password must be more than 3 Characters")
    private String password;
}
