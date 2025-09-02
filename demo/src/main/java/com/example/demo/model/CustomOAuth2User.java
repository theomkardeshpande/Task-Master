package com.example.demo.model;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {
    private final OAuth2User delegate;
    @Getter
    private final String email;
    @Getter
    private final String fullName;
    @Getter
    private final String pictureUrl;


    public CustomOAuth2User(OAuth2User delegate, String email, String fullName, String pictureUrl) {
        this.delegate = delegate;
        this.email = email;
        this.fullName = fullName;
        this.pictureUrl = pictureUrl;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return delegate.getAuthorities();
    }


    @Override
    public String getName() {
        return delegate.getName();
    }
}
