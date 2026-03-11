package com.example.demo.Model;

public class PasswordResetRequest {

    private String token;
    private String newPassword;

    // Getters
    public String getToken() {
        return token;
    }

    public String getNewPassword() {
        return newPassword;
    }

    // Setters
    public void setToken(String token) {
        this.token = token;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
