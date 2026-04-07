package com.example.demo.Service;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.PasswordResetToken;
import com.example.demo.Repository.PasswordResetTokenRepo;
import com.example.demo.Repository.ResetRepo;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final ResetRepo resetRepo;

    private final PasswordResetTokenRepo passwordResetTokenRepo;

    private final PasswordEncoder passwordEncoder;

    private final GmailApiService gmailApiService;

    public PasswordResetService(ResetRepo resetRepo, PasswordResetTokenRepo passwordResetTokenRepo, PasswordEncoder passwordEncoder, GmailApiService gmailApiService){
        this.resetRepo=resetRepo;
        this.passwordResetTokenRepo= passwordResetTokenRepo;
        this.passwordEncoder=passwordEncoder;
        this.gmailApiService=gmailApiService;
    }

    @Transactional
    public String createPasswordResetToken(String userEmail, String fullname) {
        AppUser user = resetRepo.findByEmailAndFullname(userEmail, fullname);
        if (user == null) {
            return null;
        }

        passwordResetTokenRepo.deleteByUser(user);
        passwordResetTokenRepo.flush();

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);
        PasswordResetToken resetToken = new PasswordResetToken(token, user, expiryDate);
        passwordResetTokenRepo.save(resetToken);

        try {
            sendResetLinkEmail(userEmail, token);
            System.out.println("MAIL SENT");
        } catch (Exception e) {
            System.err.println("Reset email failed: " + e.getMessage());
        }

        return token;
    }

    private void sendResetLinkEmail(String email, String token) {
        String domain = System.getenv("API_BASE_URL");
        String resetLink = domain + "/auth/reset-password?token=" + token;

        String subject = "Reset Your Task Master Password";
        String body = "To reset your password, please click the following link:\n"
                + resetLink
                + "\n\nThis link expires in 1 hour."
                + "\n\nIf you didn't request this, ignore this email.";

        gmailApiService.sendEmail(email, subject, body);
    }

    public boolean resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepo.findByToken(token);
        if (resetToken == null || resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return false;
        }
        AppUser user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        resetRepo.save(user);
        passwordResetTokenRepo.delete(resetToken);
        return true;
    }
}