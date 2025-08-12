package com.example.demo.dto;

import lombok.Data;

@Data
public class ProfileChangeRequest {

    private String fullname;
    private String email;
    private String bio;
}
