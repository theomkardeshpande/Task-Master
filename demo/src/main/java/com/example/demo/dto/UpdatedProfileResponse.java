package com.example.demo.dto;

import com.example.demo.model.AppUser;

public class UpdatedProfileResponse {
    private AppUser updatedUser;
    private String newToken;

    public UpdatedProfileResponse(AppUser updatedUser, String newToken) {
        this.updatedUser = updatedUser;
        this.newToken = newToken;
    }

    public AppUser getUpdatedUser() {
        return updatedUser;
    }

    public String getNewToken() {
        return newToken;
    }
}
