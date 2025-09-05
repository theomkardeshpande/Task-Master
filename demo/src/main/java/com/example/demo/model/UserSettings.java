package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_settings")
@Data
@NoArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "user_id", nullable = false, unique = true)
    private int userId;

    @Column(name = "theme", nullable = false)
    private String theme="light";               // "light" / "dark"

    @Column(name = "task_reminders", nullable = false)
    private boolean taskReminders=false;

    @Column(name = "task_sounds", nullable = false)
    private boolean taskSounds=false;

    @Column(name = "due_date_reminders", nullable = false)
    private boolean dueDateReminders=false;


    @Column(name = "default_priority", nullable = false)
    private String defaultPriority="medium";     // "low", "medium", "high"

    @Column(name = "tasks_per_page", nullable = false)
    private int tasksPerPage=25;

    @Column(name = "email_notifications", nullable = false)
    private boolean emailNotifications=false;

    public UserSettings(int userId) {
        this.userId = userId;
    }


}
