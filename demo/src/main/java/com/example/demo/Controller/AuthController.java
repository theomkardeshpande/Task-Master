package com.example.demo.Controller;

import com.example.demo.Dto.PasswordResetRequest;
import com.example.demo.Service.PasswordResetService;
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
    public ResponseEntity<String> processForgotPassword(@RequestParam String email,
                                                @RequestParam String fullname) {
        System.out.println("USER EMAIL:"+email);
        System.out.println("USER FULLNAME:"+fullname);

        String token = passwordResetService.createPasswordResetToken(email,fullname);
        if (token == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok("Password reset link sent to your email");
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