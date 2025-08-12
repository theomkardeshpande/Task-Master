package com.example.demo.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class UpdateTaskRequest {

    private int taskId;
    private String title;
    private String description;
    private String priority;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
}