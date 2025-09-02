package com.example.demo.repository;

import com.example.demo.model.AppUser;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<AppUser, Integer> {

    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
    AppUser findById(int user_id);
}
