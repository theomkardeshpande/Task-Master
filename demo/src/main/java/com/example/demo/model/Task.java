package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Title Couldn't be Empty")
    private String title;

    @NotBlank(message = "Description Couldn't be Empty")
    private String description;

    @NotBlank(message = "Priority Couldn't be Empty")
    private String priority;

    private boolean completed;

    private LocalDate defaultDueDate;
    private LocalDate dueDate;
    private LocalDate createdDate;

    private String userEmail;
}
