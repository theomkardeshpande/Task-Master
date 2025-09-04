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

    private String theme;               // "light" / "dark"

    @Column(name = "task_reminders")
    private boolean taskReminders=false;

    @Column(name = "task_sounds")
    private boolean taskSounds=false;

    @Column(name = "due_date_reminders")
    private boolean dueDateReminders=false;

    @Column(name = "default_priority")
    private String defaultPriority;     // "low", "medium", "high"

    @Column(name = "tasks_per_page")
    private int tasksPerPage;

    @Column(name = "email_notifications")
    private boolean emailNotifications=false;

    public UserSettings(int userId) {
        this.userId = userId;
        this.theme="light";
        this.setDueDateReminders(false);
        this.setTaskReminders(false);
        this.setTaskSounds(false);
        this.setDefaultPriority("medium");
        this.setTasksPerPage(25);
        this.setEmailNotifications(false);
    }


}
