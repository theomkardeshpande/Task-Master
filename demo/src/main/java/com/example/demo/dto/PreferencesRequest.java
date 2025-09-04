package com.example.demo.dto;

import lombok.Data;

@Data
public class PreferencesRequest {
    private int userId;

    private String theme;               // "light" / "dark"

    private boolean taskSounds;

    private boolean dueDateReminders;

    private String defaultPriority;     // "low", "medium", "high"

    private int tasksPerPage;

}
