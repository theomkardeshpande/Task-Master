package com.example.demo.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class VerificationEmail {

    private final GmailApiService gmailApiService;
    private final String domain;

    public VerificationEmail(
            GmailApiService gmailApiService,
            @Value("${spring.application.api.base-url}") String domain
    ) {
        this.gmailApiService = gmailApiService;
        this.domain = domain;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        String baseUrl = domain.endsWith("/") ? domain.replaceAll("/+$", "") : domain;
        String confirmationUrl = baseUrl + "/verify-account?token=" + token;

        String subject = "Email Verification - TaskMaster";
        String body = "Thank you for registering.\n"
                + "Please click the link below to verify your account:\n"
                + confirmationUrl;

        try {
            gmailApiService.sendEmail(toEmail, subject, body);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email to: " + toEmail, e);
        }
    }
}