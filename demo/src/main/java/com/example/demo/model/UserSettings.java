package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="user_settings")
@Data
@NoArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "user_id", nullable = false, unique = true)
    private int userId;

    private String theme;               // "light" / "dark"

    @Column(name = "task_sounds")
    private boolean taskSounds;

    @Column(name = "due_date_reminders")
    private boolean dueDateReminders;

    @Column(name = "default_priority")
    private String defaultPriority;     // "low", "medium", "high"

    @Column(name = "tasks_per_page")
    private int tasksPerPage;

    @Column(name = "email_notifications")
    private Boolean emailNotifications;

    public UserSettings(int userId){
        this.userId=userId;
    }



}
