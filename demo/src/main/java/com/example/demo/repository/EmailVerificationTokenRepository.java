package com.example.demo.repository;

import com.example.demo.model.VerificationTokens;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface EmailVerificationTokenRepository extends JpaRepository<VerificationTokens,Integer> {

    @Query(
            value = "SELECT * FROM todo.verification_tokens WHERE user_id = ?1 AND consumed = false ORDER BY expires_at DESC LIMIT 1",
            nativeQuery = true
    )
    Optional<VerificationTokens> pendingTrue(int user_id);

    VerificationTokens findByEmail(String email);
}
