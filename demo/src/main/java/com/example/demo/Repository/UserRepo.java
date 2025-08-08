package com.example.demo.Repository;

import com.example.demo.Model.AppUser;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<AppUser, Integer> {

    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
    // Optional<AppUser> findByEmail(String email);
    AppUser findById(int user_id);
}
