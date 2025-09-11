package com.example.demo.service;

import com.example.demo.model.VerificationTokens;
import com.example.demo.repository.EmailVerificationTokenRepository;
import com.example.demo.model.AppUser;
import com.example.demo.repository.UserRepo;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.*;
import java.util.Objects;
import java.util.Optional;


@Service
public class EmailVerificationService {

    private static final Duration TTL = Duration.ofMinutes(10);

    private final EmailVerificationTokenRepository tokens;
    private final UserRepo userRepository;
    private final EmailService mail;

    public EmailVerificationService(EmailVerificationTokenRepository tokens,
                                    UserRepo userRepository,
                                    EmailService mail) {
        this.tokens = tokens;
        this.userRepository = userRepository;
        this.mail = mail;
    }


    @Transactional
    public String sendCode(AppUser user) {
        // invalidate previous pending token (optional)
        tokens.pendingTrue(user.getUser_id())
                .ifPresent(t -> { t.setConsumed(true); tokens.save(t); });

        String code = generateSixDigitCode();
        VerificationTokens t = new VerificationTokens();
        t.setEmail(user.getEmail());
        t.setUserId(user.getUser_id());
        t.setCode(code);
        t.setExpiresAt(LocalDateTime.now().plus(TTL));
        tokens.save(t);
        String subject="Your verification code";
        String content="Use this code to verify your email: \n" + code + "\n This code expires in 10 minutes.\n";
        mail.sendEmailAsync(user.getEmail(),subject,content);
        return "Mail Is Send To Your Registered Email Address";
    }

//    @Transactional
//    public boolean confirmCode(AppUser user, String code) {
//        LocalDateTime now = LocalDateTime.now();
//        return tokens.findByEmail(user.getEmail())
//                .filter(token -> token.getExpiresAt().isAfter(now))
//                .map(token -> {
//                    if(token.getCode().equals(code.trim())){
//                        token.setConsumed(true);
//                        tokens.save(token);
//
//                        if (!user.isVerified()) {
//                            user.setVerified(true);
//                            userRepository.save(user);
//                        }
//                        return true;
//                    }
//                    return false;
//                })
//                .orElse(false);
//    }

    @Transactional
    public boolean confirmCode(AppUser user, String code){
        LocalDateTime now=LocalDateTime.now();
        VerificationTokens token=tokens.findByEmail(user.getEmail());
        if(token==null){
            System.out.println("Token User Not Found");
            return false;
        }
        if(token.getExpiresAt().isAfter(now) && token.getCode().equals(code) && !user.isVerified()){
            System.out.println("TOKENS"+token.getCode());
            System.out.println("CODES"+code);
            token.setConsumed(true);
            tokens.save(token);
            user.setVerified(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    private static String generateSixDigitCode() {
        try {
            SecureRandom sr = SecureRandom.getInstanceStrong();
            int n = sr.nextInt(1_000_000); // 0..999999
            return String.format("%06d", n);
        } catch (NoSuchAlgorithmException e) {
            // Fallback if strong not available
            SecureRandom sr = new SecureRandom();
            int n = sr.nextInt(1_000_000);
            return String.format("%06d", n);
        }
    }
}
