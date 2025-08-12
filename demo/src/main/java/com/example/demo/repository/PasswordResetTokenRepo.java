package com.example.demo.repository;

import com.example.demo.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken,Integer> {
    PasswordResetToken findByToken(String token);
}
