package com.example.demo.Repository;

import com.example.demo.Model.AppUser;
import com.example.demo.Model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface PasswordResetTokenRepo extends JpaRepository<PasswordResetToken, Integer> {

    PasswordResetToken findByToken(String token);

    @Transactional
    @Modifying
    @Query("DELETE FROM PasswordResetToken p WHERE p.user = :user")
    void deleteByUser(@Param("user") AppUser user);
}