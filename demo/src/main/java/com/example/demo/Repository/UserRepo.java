package com.example.demo.Repository;

import com.example.demo.Model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<AppUser, Integer> {

    Optional<AppUser> findByEmail(String email);
}
