package com.example.demo.repository;

import com.example.demo.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VerificationTokenRepo extends JpaRepository<VerificationToken, Integer> {
    VerificationToken findByToken(String token);
}