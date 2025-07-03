package com.example.demo.Service;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.VerificationToken; // You will need to create this entity
import com.example.demo.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.Repository.VerificationTokenRepo;

import java.util.Date;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private VerificationTokenRepo tokenRepo; // Inject the token repository

    @Autowired
    private VerificationEmail emailService; // Inject a new service to handle sending emails

    /**
     * Creates and saves a new user, generates a verification token, and sends a verification email.
     * This method is transactional, so if sending the email fails, the user creation is rolled back.
     */
    @Transactional
    public void registerUser(AppUser user) {
        // In a real app, you would hash the password here before saving
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalStateException("Email already in use.");
        }

        // 1. Save the user with the account disabled
        user.setVerified(false);
        AppUser savedUser = userRepo.save(user);
        System.out.println("Saving user: " + user);

        // 2. Create and save the verification token
        VerificationToken verificationToken = new VerificationToken(savedUser);
        tokenRepo.save(verificationToken);

        // 3. Send the verification email
        emailService.sendVerificationEmail(savedUser.getEmail(), verificationToken.getToken());
    }

    /**
     * Verifies a user's account based on the provided token.
     * @param token The verification token.
     * @return A message indicating the result of the verification.
     */
    public String verifyAccount(String token) {
        VerificationToken verificationToken = tokenRepo.findByToken(token);

        // Check if the token is valid
        if (verificationToken == null) {
            return "Invalid verification token.";
        }
        // Check if the token has expired
        if (verificationToken.getExpiryDate().before(new Date())) {
            return "Verification token has expired.";
        }

        // Enable the user
        AppUser user = verificationToken.getUser();
        user.setVerified(true);
        userRepo.save(user);

        // You might want to delete the token after it's been used
        // tokenRepo.delete(verificationToken);

        return "Account successfully verified!";
    }

    public Optional<AppUser> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public void saveUser(AppUser appUser) {
    }
}