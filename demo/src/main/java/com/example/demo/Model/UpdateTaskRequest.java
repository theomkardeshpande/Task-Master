package com.example.demo.Model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class UpdateTaskRequest {

    private int taskId;
    private String taskTitle;
    private String taskDescription;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate completionDate;

    // Getters
    public int getTaskId() {
        return taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public String getTaskDescription() {
        return taskDescription;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    // Setters
    public void setTaskId(int taskId) {
        this.taskId = taskId;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public void setTaskDescription(String taskDescription) {
        this.taskDescription = taskDescription;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }
}