package com.example.demo.service;

import com.example.demo.model.AppUser;
import com.example.demo.model.PasswordResetToken;
import com.example.demo.repository.PasswordResetTokenRepo;
import com.example.demo.repository.ResetRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final ResetRepo resetRepo;
    private final PasswordResetTokenRepo tokenRepo;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;

    private static final SecureRandom RNG = new SecureRandom();

    public String createPasswordResetToken(String email, String fullname) {
        // Always return generic response to caller; do not leak user existence
        AppUser user = resetRepo.findByEmailAndFullname(email, fullname);
        if (user == null) {
            // Do nothing; simply pretend the email was sent
            return null;
        }

        Optional<PasswordResetToken> getUser=tokenRepo.findByUser_Email(email);
        if(getUser.isPresent()){
            PasswordResetToken existing = getUser.get();
            String token=existing.getToken();
            existing.setToken(sha256(token));
            existing.setExpiryDate(LocalDateTime.now().plusHours(1));
            tokenRepo.save(existing);
            sendResetLinkEmail(email, token);
            return sha256(token);
        } else {
            String token = newToken();
            PasswordResetToken prt = new PasswordResetToken(user,sha256(token), LocalDateTime.now().plusHours(1));
            tokenRepo.save(prt);
            sendResetLinkEmail(email, token);
            return sha256(token);
        }

    }

    @Transactional
    public boolean resetPassword(String rawToken, String newPassword) {
        String tokenHash = sha256(rawToken);
        Optional<PasswordResetToken> opt = tokenRepo.findByToken(tokenHash);
        if (opt.isEmpty()) return false;
        PasswordResetToken t = opt.get();
        if (t.getExpiryDate().isBefore(LocalDateTime.now())) return false;

        AppUser user = t.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        resetRepo.save(user);
        tokenRepo.delete(t); // single-use
        return true;
    }

    private static String newToken() {
        byte[] bytes = new byte[14]; // 256 bits
        RNG.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); // URL-safe
    }

    private static String sha256(String value) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private void sendResetLinkEmail(String email, String token) {
        String domain = System.getenv("BASE_URL");
        String link = domain + "/auth/reset-password?token=" + token;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Reset Your Password");
        message.setText("To reset your password, click:\n" + link);
        mailSender.send(message);
    }
}
