package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@NoArgsConstructor
@Entity
@Data
@Table(name = "password_reset_token")
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int tokenId;

    @Column(nullable = false,unique = true)
    private String token;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id",referencedColumnName = "user_id")
    private AppUser user;

    @Column(name = "email")
    private String email;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

//    public PasswordResetToken(String token, AppUser user, LocalDateTime expiryDate) {
//
//    }

    public PasswordResetToken(AppUser user, String tokenHash, LocalDateTime expiry) {
        this.user=user;
        this.token=tokenHash;
        this.email=user.getEmail();
        this.expiryDate=expiry;
    }
}
