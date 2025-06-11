package com.example.demo.Repository;

import com.example.demo.Model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResetRepo extends JpaRepository<AppUser,Integer> {
    AppUser findByEmailAndFullname(String email,String fullname);
}
