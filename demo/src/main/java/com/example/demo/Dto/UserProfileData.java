package com.example.demo.Dto;

import lombok.Data;

@Data
public class UserProfileData {

    private String fullname;
    private String email;
    private String bio;
    private int id;

    private byte[] profilePicture;
}
