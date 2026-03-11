package com.example.demo.Model;

import jakarta.persistence.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Entity
public class VerificationToken {

    private static final int EXPIRATION_MINUTES = 15;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String token;
    private Date expiryDate;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private AppUser user;

    public VerificationToken() {}

    public VerificationToken(AppUser user) {
        this.user = user;
        this.token = UUID.randomUUID().toString();
        this.expiryDate = Date.from(Instant.now().plus(EXPIRATION_MINUTES, ChronoUnit.MINUTES));
    }

    // Getters
    public int getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public Date getExpiryDate() {
        return expiryDate;
    }

    public AppUser getUser() {
        return user;
    }

    // Setters
    public void setId(int id) {
        this.id = id;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiryDate(Date expiryDate) {
        this.expiryDate = expiryDate;
    }

    public void setUser(AppUser user) {
        this.user = user;
    }
}