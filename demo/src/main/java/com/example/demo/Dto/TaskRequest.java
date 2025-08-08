package com.example.demo.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.cglib.core.Local;

import java.time.LocalDate;

@Data
public class TaskRequest {

    private String title;
    private String description;

    private String priority;

    private LocalDate createdDate;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
}
