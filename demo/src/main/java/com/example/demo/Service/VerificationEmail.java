package com.example.demo.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class VerificationEmail {

    @Autowired
    private JavaMailSender mailSender;

    public void sendVerificationEmail(String toEmail, String token) {
        String subject = "Email Verification";
        String domain=System.getenv("API_BASE_URL");
        String confirmationUrl = "http://"+domain+"/verify-account?token=" + token;
        String message = "Thank you for registering.\n Please Login With Your Account and link below to verify your account.";

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(toEmail);
        email.setSubject(subject);
        email.setText(message + "\n" + confirmationUrl);

        mailSender.send(email);
    }
}