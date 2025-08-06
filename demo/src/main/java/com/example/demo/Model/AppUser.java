package com.example.demo.Model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Entity
@Data
@Table(name = "app_user")
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int user_id;

    @Column(name = "reserved")
    private boolean reserved;

    @NotBlank(message = "Full Name is Required")
    @Size(min = 2, message = "Name Should be more than 2 Characters")
    private String fullname;

    @Email(message = "Invalid Email Address")
    @NotBlank(message = "Email is Empty")
    private String email;

    @NotBlank(message = "Password is Empty")
    @Size(min = 3, message = "Password must be atleast more than 3 characters")
    private String password;

    private String role;

    private LocalDateTime registerationTime;



}
