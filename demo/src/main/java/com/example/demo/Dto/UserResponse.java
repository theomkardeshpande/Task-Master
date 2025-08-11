package com.example.demo.Dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private int user_id;
    private String fullname;
    private String email;
    private LocalDateTime registerationTime;
}
