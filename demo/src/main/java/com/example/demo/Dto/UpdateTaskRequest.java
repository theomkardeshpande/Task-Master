package com.example.demo.Dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateTaskRequest {

    private int taskId;
    private String taskTitle;
    private String taskDescription;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate completionDate;
}