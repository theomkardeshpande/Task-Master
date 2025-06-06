package com.example.demo.Model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {

    @Email(message = "Invalid Email Format")
    @NotBlank(message = "Email is Required")
    private String email;

    @Size(min = 3, message = "Password must be more than 3 Characters")
    @NotBlank(message = "Password is Required")
    private String password;
}
