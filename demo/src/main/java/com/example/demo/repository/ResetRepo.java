package com.example.demo.repository;

import com.example.demo.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResetRepo extends JpaRepository<AppUser,Integer> {
    AppUser findByEmailAndFullname(String email,String fullname);
}
