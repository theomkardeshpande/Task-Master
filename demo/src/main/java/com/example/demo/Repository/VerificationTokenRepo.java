package com.example.demo.Repository;

import com.example.demo.Model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VerificationTokenRepo extends JpaRepository<VerificationToken, Integer> {
    VerificationToken findByToken(String token);
}