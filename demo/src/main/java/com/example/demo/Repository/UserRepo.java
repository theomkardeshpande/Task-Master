package com.example.demo.Repository;

import com.example.demo.Model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<AppUser, Integer> {

    AppUser findByEmail(String email);
    boolean existsByEmail(String email);
    
}
