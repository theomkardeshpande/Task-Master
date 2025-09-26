package com.example.demo.controller;

import com.example.demo.dto.ForgetPasswordRequest;
import com.example.demo.dto.PasswordResetRequest;
import com.example.demo.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;


@Controller
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private PasswordResetService passwordResetService;


    //  Handle Forgot Password Request (send reset email)
    @PostMapping("/forgot-password")
    @ResponseBody
    public ResponseEntity<String> processForgotPassword(@RequestBody ForgetPasswordRequest request) throws Exception {
        System.out.println("USER EMAIL:"+request.getEmail());
        System.out.println("USER FULLNAME:"+request.getFullname());

        String token = passwordResetService.createPasswordResetToken(request.getEmail(),request.getFullname());
        System.out.println("RETURN TOKEN:"+token);
        if (token == null) {
            System.out.println("SEND BAD RESPONSE");
            return ResponseEntity.badRequest().body("Please Check Email Address And Fullname Properly");
        }else {
            return ResponseEntity.ok("Password reset link sent to your email");
        }
    }

    // Render the Reset Password Page (user clicks email link)
    @GetMapping("/reset-password")
    public String showResetPasswordPage(@RequestParam("token") String token, Model model) {
        model.addAttribute("token",token); // Pass token to the view
        return "reset-password"; // This serves `reset-password.html`
    }

    // Process Reset Password Submission
    @PostMapping("/reset-password")
    @ResponseBody
    public ResponseEntity<String> processResetPassword(@RequestBody PasswordResetRequest request) {
        String token=request.getToken();
        String newPassword=request.getNewPassword();

        // Check if token or password is empty
        if (token == null || token.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body("Token or new password cannot be empty.");
        }

        boolean result = passwordResetService.resetPassword(token, newPassword);

        if (!result) {
            return ResponseEntity.badRequest().body("Invalid or expired reset token.");
        }

        return ResponseEntity.ok("Password successfully reset.");
    }
}