package com.example.demo.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@Entity
@Table(name = "app_user")
public class AppUser {

    // Setters
    // Getters
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
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is Empty")
    @Size(min = 3, message = "Password must be atleast more than 3 characters")
    private String password;

    private String role;

    private boolean verified;

}
