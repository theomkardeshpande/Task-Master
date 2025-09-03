package com.example.demo.dto;

import lombok.Data;

@Data
public class ForgetPasswordRequest {
    String email;
    String fullname;
}
