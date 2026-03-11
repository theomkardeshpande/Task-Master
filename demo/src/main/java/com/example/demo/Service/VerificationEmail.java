package com.example.demo.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class VerificationEmail {  // ✅ Renamed to follow *Service convention

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String domain;

    // ✅ Full constructor injection — all dependencies in one place, easy to unit test
    public VerificationEmail(
            JavaMailSender mailSender,
            @Value("${spring.mail.username}") String fromEmail,
            @Value("${spring.application.api.base-url}") String domain
    ) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.domain = domain;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        // ✅ Strip trailing slash to prevent double-slash URLs
        String baseUrl = domain.endsWith("/") ? domain.replaceAll("/+$", "") : domain;
        String subject = "Email Verification";
        String confirmationUrl = baseUrl + "/verify-account?token=" + token;
        String message = "Thank you for registering.\n"
                + "Please click the link below to verify your account:\n"
                + confirmationUrl;

        SimpleMailMessage email = new SimpleMailMessage();
        email.setFrom(fromEmail);
        email.setTo(toEmail);
        email.setSubject(subject);
        email.setText(message);

        try {
            mailSender.send(email);  // ✅ Handle mail failures gracefully
        } catch (MailException e) {
            throw new RuntimeException("Failed to send verification email to: " + toEmail, e);
        }
    }
}
