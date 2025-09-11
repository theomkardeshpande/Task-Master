package com.example.demo.model;


import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Setter
public class CustomUserDetails implements UserDetails {

    private final AppUser user;
    public CustomUserDetails(AppUser user){
        this.user=user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("USER"));
    }

    public String getPassword() {
        return user.getPassword();
    }

    public String getUsername() {
        return user.getEmail();
    }

    public String getFullname() {
        return user.getFullname();
    }

    public int getUserId() {return user.getUser_id();}

    public String getRole(){ return user.getRole();}

    public boolean isVerified(){return user.isVerified();}

    public String getBio(){return  user.getBio();}

    public byte[] getProfilePicture(){return user.getProfilePicture();}
}
