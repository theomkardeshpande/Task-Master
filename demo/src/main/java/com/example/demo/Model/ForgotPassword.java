package com.example.demo.Model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPassword {

    @NotBlank(message = "Please Provide your Email")
    private String email;

    @NotBlank(message = "Please Provide User Fullname")
    private String fullname;
}
