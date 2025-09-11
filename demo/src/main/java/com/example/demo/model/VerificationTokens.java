package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@Entity
@Data
@Table(name = "verification_tokens")
public class VerificationTokens {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "userId")
    private int userId;

    @Column(name = "code")
    private String code;

    @Column(name = "email")
    private String email;

    @Column(name = "expiresAt")
    private LocalDateTime expiresAt;

    @Column(name = "consumed", nullable = false)
    private boolean consumed=false;


}
