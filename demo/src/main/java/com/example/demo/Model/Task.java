package com.example.demo.Model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
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

    private Date completionDate;

    private String userEmail;
}
