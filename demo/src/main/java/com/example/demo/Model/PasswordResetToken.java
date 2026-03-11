package com.example.demo.Model;

import jakarta.persistence.*;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@NoArgsConstructor
@Entity
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

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    public PasswordResetToken(String token,AppUser user,LocalDateTime expiryDate){
        this.token=token;
        this.user=user;
        this.expiryDate=expiryDate;
    }

    // Getters
    public int getTokenId() {
        return tokenId;
    }

    public String getToken() {
        return token;
    }

    public AppUser getUser() {
        return user;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    // Setters
    public void setTokenId(int tokenId) {
        this.tokenId = tokenId;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
}
