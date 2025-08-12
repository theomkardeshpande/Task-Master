package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskRequest {

    private String title;
    private String description;

    private String priority;

    private LocalDate createdDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
}
