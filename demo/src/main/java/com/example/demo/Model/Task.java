package com.example.demo.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@NoArgsConstructor
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int task_id;

    @NotBlank(message = "Title Couldn't be Empty")
    private String title;

    @NotBlank(message = "Description Couldn't be Empty")
    private String description;

    private boolean isCompleted;

    private LocalDate completionDate;

    private String userEmail;

    // Getters
    public int getTaskId() {
        return task_id;
    }

    public int getTask_id() {
        return task_id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public LocalDate getCompletionDate() {
        return completionDate;
    }

    public String getUserEmail() {
        return userEmail;
    }

    // Setters
    public void setTask_id(int task_id) {
        this.task_id = task_id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCompleted(boolean completed) {
        isCompleted = completed;
    }

    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
}
