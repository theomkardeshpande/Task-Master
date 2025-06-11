package com.example.demo.Repository;

import com.example.demo.Model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken,Integer> {
    PasswordResetToken findByToken(String token);
//    void deleteByUserId(Integer user_id);
}
